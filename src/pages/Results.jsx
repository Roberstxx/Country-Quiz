// src/pages/Results.jsx
import { useNavigate } from "react-router-dom";
import { computeNextMode, getInitialMode, setNextMode } from "/src/utils/modes.js";
import congratsImg from "/src/assets/congrats.png";

export default function Results() {
  const navigate = useNavigate();

  const score = Number(sessionStorage.getItem("quiz.score") || 0);
  const total = Number(sessionStorage.getItem("quiz.total") || 10);
  const currentMode = getInitialMode();

  function playAgain() {
    const next = computeNextMode(currentMode);
    setNextMode(next);
    sessionStorage.setItem("quiz.score", "0");
    sessionStorage.removeItem("quiz.answers");
    navigate("/quiz", { replace: true });
  }

  return (
    <section className="results">
      <div className="card results-card results-card--narrow">
        <div className="result-hero" aria-hidden="true">
          <img src={congratsImg} alt="" />
        </div>

        {/* Título como en el mock */}
        <h2 className="results-title m0">
          Congrats! You completed<br/>the quiz.
        </h2>

        {/* Subtítulo como en el mock (si quieres gramática correcta usa "answered") */}
        <p className="results-subtitle m0">
          You answer {score}/{total} correctly
        </p>

        <button className="btn results-btn" onClick={playAgain}>
          Play again
        </button>
      </div>
    </section>
  );
}
