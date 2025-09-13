// src/pages/Quiz.jsx
import { useEffect, useMemo, useState } from "react";
import { fetchCountries, fetchCountriesLight } from "/src/services/countriesApi.js";
import { buildByType } from "/src/services/questionBuilder.js";
import { getInitialMode } from "/src/utils/modes.js";
import Bubble from "/src/components/Bubble.jsx";
import OptionItem from "/src/components/OptionItem.jsx";
import ProgressBar from "/src/components/ProgressBar.jsx";

const TOTAL = 10;

export default function Quiz(){
  const [mode, setMode] = useState(getInitialMode()); // "flag" | "capital" | ...
  const [status, setStatus] = useState("loading");    // loading | ready | error
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [locked, setLocked] = useState(false);
  const [choice, setChoice] = useState(null);

  // Carga países y prepara preguntas según el modo
  useEffect(() => {
    (async () => {
      try {
        const countries = mode === "flag"
          ? await fetchCountriesLight()
          : await fetchCountries();

        const qb = buildByType(countries, mode, TOTAL);
        setQuestions(qb);
        setStatus("ready");
      } catch (e) {
        console.error(e);
        setStatus("error");
      }
    })();
  }, [mode]);

  // Mapa de respuestas guardadas (para no perder feedback al movernos)
  const answeredMap = useMemo(()=>{
    const raw = sessionStorage.getItem("quiz.answers");
    return raw ? JSON.parse(raw) : {};
  }, []);

  useEffect(() => {
    if (status !== "ready" || !questions[idx]) return;
    const q = questions[idx];
    const saved = answeredMap[q.id];
    if (saved) { setChoice(saved.choice); setLocked(true); }
    else { setChoice(null); setLocked(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, status, questions]);

  if (status === "loading") return <p className="muted">Cargando preguntas…</p>;
  if (status === "error")   return <p className="muted">No se pudo cargar la información.</p>;

  const q = questions[idx];

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
    setChoice(opt);
    const correct = opt === q.answer;
    setLocked(true);
    persistAnswer(q.id, opt, correct);
  }

  function stateFor(opt) {
    if (!locked) return (opt === choice ? "selected" : "idle");
    if (opt === q.answer) return "correct";
    if (opt === choice && opt !== q.answer) return "wrong";
    return "idle";
  }

  function go(i) { setIdx(i); }

  function finish() {
    window.location.href = "/results";
  }

  return (
    <section className="quiz-wrap">
      <div className="quiz-card card">
        {/* Modo actual como subtítulo pequeño, opcional */}
        <div className="muted" style={{ textAlign:"right", marginBottom:6 }}>
          Modo: <strong>{labelForMode(mode)}</strong>
        </div>

        <div className="bubbles" aria-label="Navegación de preguntas">
          {Array.from({length: TOTAL}).map((_, i) => (
            <Bubble key={i} number={i+1} active={i===idx} onClick={()=> go(i)} />
          ))}
        </div>

        <h2 className="subtitle center-text m0" style={{ marginBottom: 18 }}>{q.prompt}</h2>

        {/* Mostrar bandera solo en modo "flag" */}
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

        <div className="quiz-toprow">
          <div className="spacer" />
          <ProgressBar value={idx + 1} max={TOTAL} />
          <div className="spacer" />
        </div>

        <div className="options" role="radiogroup" aria-label="Opciones de respuesta">
          {q.options.map((opt) => (
            <OptionItem
              key={opt}
              text={opt}
              state={stateFor(opt)}
              disabled={locked}
              onClick={() => pick(opt)}
            />
          ))}
        </div>
      </div>

      <div className="quiz-actions" style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button className="btn" onClick={()=> go(Math.max(0, idx - 1))}>Anterior</button>
        <button className="btn" onClick={()=> go(Math.min(TOTAL - 1, idx + 1))}>Siguiente</button>
        <button className="btn" onClick={finish}>Finalizar</button>
      </div>
    </section>
  );
}

function labelForMode(mode){
  switch(mode){
    case "flag": return "Banderas";
    case "capital": return "Capitales";
    case "region": return "Regiones";
    case "currency": return "Monedas";
    case "language": return "Idiomas";
    default: return mode;
  }
}
