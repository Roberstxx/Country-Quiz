// src/pages/Quiz.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCountries, fetchCountriesLight } from "/src/services/countriesApi.js";
import { buildByType } from "/src/services/questionBuilder.js";
import { getInitialMode } from "/src/utils/modes.js";

import Bubble from "/src/components/Bubble.jsx";
import OptionItem from "/src/components/OptionItem.jsx";
import ProgressBar from "/src/components/ProgressBar.jsx";
import { scoreBus } from "/src/store/scoreBus.js";

const TOTAL = 10;

export default function Quiz() {
  const navigate = useNavigate();

  // ---- Estado principal ----
  const [mode] = useState(getInitialMode());      // "flag" | "capital" | "region" | ...
  const [status, setStatus] = useState("loading");// loading | ready | error
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [locked, setLocked] = useState(false);
  const [choice, setChoice] = useState(null);

  // Mantenemos el mapa de respuestas en React para re-render inmediato
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

        const qb = buildByType(countries, mode, TOTAL); // [{id, prompt, options, answer, flagUrl?}, ...]
        setQuestions(qb);

        // Guardar contexto de la ronda (IDs + modo + total) para Results/score
        const round = { mode, ids: qb.map(q => q.id), total: TOTAL };
        sessionStorage.setItem("quiz.round", JSON.stringify(round));
        sessionStorage.setItem("quiz.total", String(TOTAL));

        // Avisar a la UI (copa) que hay nueva ronda / score 0
        scoreBus.dispatchEvent(new Event("score"));

        setStatus("ready");
        setIdx(0);
        setLocked(false);
        setChoice(null);
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    })();
  }, [mode]);

  // IDs de las preguntas de ESTA ronda (derivado)
  const questionIds = useMemo(() => questions.map(q => q.id), [questions]);

  // ¿Cuántas respondidas en ESTA ronda y modo?
  const answeredCount = useMemo(() => {
    let count = 0;
    for (const qid of questionIds) {
      const a = answers[qid];
      if (a && a.mode === mode) count++;
    }
    return count;
  }, [answers, questionIds, mode]);

  // ---- Restaurar estado al cambiar de pregunta ----
  useEffect(() => {
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

  // ---- Navegación por teclado (opcional) ----
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight") setIdx(i => Math.min(TOTAL - 1, i + 1));
      else if (e.key === "ArrowLeft") setIdx(i => Math.max(0, i - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ---- Persistencia y puntaje de la ronda ----
  function persistAnswer(qid, userChoice, correct) {
    // 1) Actualiza mapa en memoria y sessionStorage
    const next = {
      ...answers,
      [qid]: { choice: userChoice, correct, mode },
    };
    setAnswers(next);
    sessionStorage.setItem("quiz.answers", JSON.stringify(next));

    // 2) Lee contexto de ronda
    const round = JSON.parse(sessionStorage.getItem("quiz.round") || "{}");
    const ids = Array.isArray(round.ids) ? round.ids : [];

    // 3) Calcula score SOLO con las preguntas de ESTA ronda y modo
    let score = 0;
    for (const id of ids) {
      const a = next[id];
      if (a && a.correct && a.mode === mode) score++;
    }

    // 4) Persiste score/total para Results y header
    sessionStorage.setItem("quiz.score", String(score));
    sessionStorage.setItem("quiz.total", String(round.total || ids.length || TOTAL));

    // 5) 🔔 avisa al header (y a quien use el hook) que el score cambió
    scoreBus.dispatchEvent(new Event("score"));
  }

  // ---- Selección de opción ----
  function pick(opt) {
    if (locked) return;
    const q = questions[idx];
    setChoice(opt);
    const correct = opt === q.answer;
    setLocked(true);
    persistAnswer(q.id, opt, correct);
  }

  // ---- Estado visual por opción ----
  // Reemplaza tu stateFor por este:
function stateFor(opt) {
  const q = questions[idx];

  // Antes de bloquear: solo "selected" si coincide
  if (!locked) return opt === choice ? "selected" : "idle";

  // Ya bloqueado: conservamos "selected" en lo que el usuario marcó
  if (opt === q.answer) {
    // Correcta (si además la eligió, queda "correct selected")
    return (opt === choice) ? "correct selected" : "correct";
  }
  if (opt === choice && opt !== q.answer) {
    // Elegida pero incorrecta → "wrong selected"
    return "wrong selected";
  }
  return "idle";
}

  // ---- Render condicional sin romper orden de hooks ----
  let content = null;

  if (status === "loading") {
    content = <p className="muted">Cargando preguntas…</p>;
  } else if (status === "error") {
    content = <p className="muted">No se pudo cargar la información.</p>;
  } else if (questions.length) {
    const q = questions[idx];

    content = (
      <>
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
              <Bubble key={i} number={i + 1} active={i === idx} onClick={() => setIdx(i)} />
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
                style={{ objectFit: "cover", borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,.25)" }}
              />
            </div>
          )}

          {/* Progreso: respondidas / TOTAL */}
          <div className="quiz-toprow">
            <div className="spacer" />
            <ProgressBar value={answeredCount} max={TOTAL} />
            <div className="spacer" />
          </div>

          {/* Opciones */}
          <div className="options" role="radiogroup" aria-label="Opciones de respuesta">
            {q.options.map((opt) => (
              <OptionItem
                key={opt}
                label={opt}
                text={opt}            // dejamos ambas props por compatibilidad
                state={stateFor(opt)} // 'idle' | 'selected' | 'correct' | 'wrong'
                disabled={locked}
                onClick={() => pick(opt)}
              />
            ))}
          </div>
        </div>
      </>
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
