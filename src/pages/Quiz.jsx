// src/pages/Quiz.jsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCountries, fetchCountriesLight } from "/src/services/countriesApi.js";
import { buildByType } from "/src/services/questionBuilder.js";
import { getInitialMode } from "/src/utils/modes.js";

import Bubble from "/src/components/Bubble.jsx";
import OptionItem from "/src/components/OptionItem.jsx";
// (Progreso eliminado)
// import ProgressBar from "/src/components/ProgressBar.jsx";
import { scoreBus } from "/src/store/scoreBus.js";

const TOTAL = 10;

export default function Quiz() {
  const navigate = useNavigate();

  // ---- Estado principal ----
  const [mode] = useState(getInitialMode());           // "flag" | "capital" | "region" | ...
  const [status, setStatus] = useState("loading");     // loading | ready | error
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [locked, setLocked] = useState(false);
  const [choice, setChoice] = useState(null);

  // Mapa de respuestas persistido (render inmediato + sessionStorage)
  const [answers, setAnswers] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("quiz.answers") || "{}"); }
    catch { return {}; }
  });

  const cardRef = useRef(null);

  // ---- Cargar países y preparar ronda ----
  useEffect(() => {
    (async () => {
      try {
        const countries = mode === "flag"
          ? await fetchCountriesLight()
          : await fetchCountries();

        const qb = buildByType(countries, mode, TOTAL); // [{id,prompt,options,answer,flagUrl?}, ...]
        setQuestions(qb);

        // Contexto de ronda para Results/score
        const round = { mode, ids: qb.map(q => q.id), total: TOTAL };
        sessionStorage.setItem("quiz.round", JSON.stringify(round));
        sessionStorage.setItem("quiz.total", String(TOTAL));

        // Reset visual inicial
        setStatus("ready");
        setIdx(0);
        setLocked(false);
        setChoice(null);

        // Avisar score 0
        scoreBus.dispatchEvent(new Event("score"));
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    })();
  }, [mode]);

  // IDs de la ronda
  const questionIds = useMemo(() => questions.map(q => q.id), [questions]);

  // Cantidad respondida en esta ronda y modo
  const answeredCount = useMemo(() => {
    let count = 0;
    for (const qid of questionIds) {
      const a = answers[qid];
      if (a && a.mode === mode) count++;
    }
    return count;
  }, [answers, questionIds, mode]);

  // ---- Helper de navegación segura entre preguntas ----
  const goto = useCallback((i) => {
    // Reset inmediato antes del cambio de idx para evitar estados “fantasma”
    setLocked(false);
    setChoice(null);
    setIdx(Math.max(0, Math.min(TOTAL - 1, i)));
  }, []);

  // ---- Restaurar estado al cambiar de pregunta (sin pintar frame intermedio) ----
  useLayoutEffect(() => {
    if (status !== "ready" || !questions[idx]) return;
    const q = questions[idx];
    const saved = answers[q.id];
    if (saved) { setChoice(saved.choice); setLocked(true); }
    else { setChoice(null); setLocked(false); }

    // Accesibilidad + scroll
    requestAnimationFrame(() => {
      cardRef.current?.focus({ preventScroll: true });
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [idx, status, questions, answers]);

  // ---- Autofinalizar cuando completes la ronda ----
  useEffect(() => {
    if (status === "ready" && answeredCount >= TOTAL) {
      navigate("/results", { replace: true });
    }
  }, [answeredCount, status, navigate]);

  // ---- Navegación por teclado ----
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight") goto(idx + 1);
      else if (e.key === "ArrowLeft") goto(idx - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goto, idx]);

  // ---- Persistencia y puntaje de la ronda ----
  const persistAnswer = useCallback((qid, userChoice, correct) => {
    // 1) Actualiza respuestas
    const next = { ...answers, [qid]: { choice: userChoice, correct, mode } };
    setAnswers(next);
    sessionStorage.setItem("quiz.answers", JSON.stringify(next));

    // 2) Contexto de ronda
    const round = JSON.parse(sessionStorage.getItem("quiz.round") || "{}");
    const ids = Array.isArray(round.ids) ? round.ids : [];

    // 3) Calcula score solo para esta ronda y modo
    let score = 0;
    for (const id of ids) {
      const a = next[id];
      if (a && a.correct && a.mode === mode) score++;
    }

    // 4) Persiste score/total
    sessionStorage.setItem("quiz.score", String(score));
    sessionStorage.setItem("quiz.total", String(round.total || ids.length || TOTAL));

    // 5) Notifica a quien escuche (Header, etc.)
    scoreBus.dispatchEvent(new Event("score"));
  }, [answers, mode]);

  // ---- Selección de opción ----
  const pick = useCallback((opt) => {
    if (locked) return;
    const q = questions[idx];
    if (!q) return;
    setChoice(opt);
    const correct = opt === q.answer;
    setLocked(true);
    persistAnswer(q.id, opt, correct);
  }, [locked, questions, idx, persistAnswer]);

  // ---- Estado visual por opción (robusto, sin “flash”) ----
  const stateFor = useCallback((opt) => {
    const q = questions[idx];
    if (!q) return "idle";

    const saved = answers[q.id]; // { choice, correct, mode } o undefined
    if (!saved) {
      // Sin respuesta guardada: solo “selected” en la elección actual
      return opt === choice ? "selected" : "idle";
    }

    const isUserChoice = opt === saved.choice;
    const isCorrect = opt === q.answer;

    if (isCorrect) return isUserChoice ? "correct selected" : "correct";
    if (isUserChoice) return "wrong selected";
    return "idle";
  }, [questions, idx, answers, choice]);

  // ---- Render ----
  let content = null;

  if (status === "loading") {
    content = <p className="muted">Cargando preguntas…</p>;
  } else if (status === "error") {
    content = (
      <div className="center-text">
        <p className="muted">No se pudo cargar la información.</p>
        <button className="btn" onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  } else if (questions.length) {
    const q = questions[idx];

    content = (
      <div
        ref={cardRef}
        className="quiz-card card"
        tabIndex={-1}
        aria-labelledby="quiz-question-title"
      >
        {/* Modo actual */}
        <div className="muted" style={{ textAlign: "right", marginBottom: 6 }}>
          Modo: <strong>{labelForMode(mode)}</strong>
        </div>

        {/* Burbujas 1–10 */}
        <div className="bubbles" aria-label="Navegación de preguntas">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <Bubble
              key={i}
              number={i + 1}
              active={i === idx}
              onClick={() => goto(i)}
            />
          ))}
        </div>

        {/* Enunciado */}
        <h2 id="quiz-question-title" className="subtitle center-text m0" style={{ marginBottom: 18 }}>
          {q.prompt}
        </h2>

        {/* Bandera (solo modo “flag”) */}
        {mode === "flag" && q.flagUrl && (
          <div style={{ display: "grid", placeItems: "center", marginBottom: 16 }}>
            <img
              src={q.flagUrl}
              alt={`Flag of ${q.answer}`}
              width="112"
              height="80"
              decoding="async"
              loading="eager"
              style={{ objectFit: "cover", borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,.25)" }}
            />
          </div>
        )}

        {/* Opciones */}
        <div className="options" role="radiogroup" aria-label="Opciones de respuesta">
          {q.options.map((opt) => (
            <OptionItem
              key={opt}
              label={opt}
              text={opt}
              state={stateFor(opt)}
              disabled={locked}
              onClick={() => pick(opt)}
            />
          ))}
        </div>
      </div>
    );
  }

  return <section className="quiz-wrap">{content}</section>;
}

function labelForMode(mode) {
  switch (mode) {
    case "flag":     return "Banderas";
    case "capital":  return "Capitales";
    case "region":   return "Regiones";
    case "currency": return "Monedas";
    case "language": return "Idiomas";
    default:         return mode;
  }
}
