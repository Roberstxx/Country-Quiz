// src/pages/Quiz.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCountries, fetchCountriesLight } from "/src/services/countriesApi.js";
import { buildByType } from "/src/services/questionBuilder.js";
import { getInitialMode } from "/src/utils/modes.js";

import Bubble from "/src/components/Bubble.jsx";
import OptionItem from "/src/components/OptionItem.jsx";
import ProgressBar from "/src/components/ProgressBar.jsx";

const TOTAL = 10;

export default function Quiz() {
  // ---- Hooks SIEMPRE al tope (orden estable) ----
  const navigate = useNavigate();

  const [mode] = useState(getInitialMode());         // "flag" | "capital" | "region" | ...
  const [status, setStatus] = useState("loading");   // loading | ready | error
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [locked, setLocked] = useState(false);
  const [choice, setChoice] = useState(null);
  const cardRef = useRef(null);

  // Carga países y arma el banco de preguntas según modo
  useEffect(() => {
    (async () => {
      try {
        const countries = mode === "flag"
          ? await fetchCountriesLight()
          : await fetchCountries();

        const qb = buildByType(countries, mode, TOTAL);
        setQuestions(qb);
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

  // Respuestas previamente guardadas en esta sesión
  const answeredMap = useMemo(() => {
    const raw = sessionStorage.getItem("quiz.answers");
    return raw ? JSON.parse(raw) : {};
  }, []);

  // Restaurar estado al cambiar de pregunta
  useEffect(() => {
    if (status !== "ready" || !questions[idx]) return;
    const q = questions[idx];
    const saved = answeredMap[q.id];
    if (saved) { setChoice(saved.choice); setLocked(true); }
    else { setChoice(null); setLocked(false); }

    // focus + scroll suave a la tarjeta
    requestAnimationFrame(() => {
      cardRef.current?.focus({ preventScroll: true });
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, status, questions]);

  // Navegación por teclado (izq/der)
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight") setIdx(i => Math.min(TOTAL - 1, i + 1));
      else if (e.key === "ArrowLeft") setIdx(i => Math.max(0, i - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ---- Lógica de respuesta ----
  function persistAnswer(qid, userChoice, correct) {
    const current = JSON.parse(sessionStorage.getItem("quiz.answers") || "{}");
    current[qid] = { choice: userChoice, correct, mode };
    sessionStorage.setItem("quiz.answers", JSON.stringify(current));
    const score = Object.values(current).filter(a => a.correct && a.mode === mode).length;
    sessionStorage.setItem("quiz.score", String(score));
    window.dispatchEvent(new Event("storage"));
  }

  function pick(opt) {
    if (locked) return;
    const q = questions[idx];
    setChoice(opt);
    const correct = opt === q.answer;
    setLocked(true);
    persistAnswer(q.id, opt, correct);
  }

  function stateFor(opt) {
    const q = questions[idx];
    if (!locked) return (opt === choice ? "selected" : "idle");
    if (opt === q.answer) return "correct";
    if (opt === choice && opt !== q.answer) return "wrong";
    return "idle";
  }

  const canPrev = idx > 0;
  const canNext = idx < TOTAL - 1;
  const go    = (i) => setIdx(i);
  const next  = () => canNext && setIdx(idx + 1);
  const prev  = () => canPrev && setIdx(idx - 1);
  const finish = () => navigate("/results"); // ← SPA: sin recargar

  // ---- Contenido condicional (sin returns antes de hooks) ----
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
          {/* Modo actual (arriba a la derecha) */}
          <div className="muted" style={{ textAlign: "right", marginBottom: 6 }}>
            Modo: <strong>{labelForMode(mode)}</strong>
          </div>

          {/* Burbujas 1–10 */}
          <div className="bubbles" aria-label="Navegación de preguntas">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <Bubble key={i} number={i + 1} active={i === idx} onClick={() => go(i)} />
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

          {/* Progreso */}
          <div className="quiz-toprow">
            <div className="spacer" />
            <ProgressBar value={idx + 1} max={TOTAL} />
            <div className="spacer" />
          </div>

          {/* Opciones */}
          <div className="options" role="radiogroup" aria-label="Opciones de respuesta">
            {q.options.map((opt) => (
              <OptionItem
                key={opt}
                label={opt}           // si tu OptionItem usa 'label'
                text={opt}            // o 'text'; deja ambos para compatibilidad
                state={stateFor(opt)} // 'idle' | 'selected' | 'correct' | 'wrong'
                disabled={locked}
                onClick={() => pick(opt)}
              />
            ))}
          </div>
        </div>

        {/* Acciones inferiores */}
        <div className="quiz-actions" aria-label="Controles de navegación">
          <button className="btn" onClick={prev} disabled={!canPrev}>Anterior</button>
          <button className="btn" onClick={next} disabled={!canNext}>Siguiente</button>
          <button className="btn" onClick={finish}>Finalizar</button>
        </div>
      </>
    );
  }

  return (
    <section className="quiz-wrap">
      {content}
    </section>
  );
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



