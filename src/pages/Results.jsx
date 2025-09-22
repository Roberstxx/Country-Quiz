// src/pages/Results.jsx
import { useNavigate } from "react-router-dom";
import { computeNextMode, getInitialMode, setNextMode } from "/src/utils/modes.js";
// Importamos la imagen
import congratsImg from "/src/assets/congrats.png";

export default function Results() {
  const navigate = useNavigate();

  const score = Number(sessionStorage.getItem("quiz.score") || 0);
  const total = Number(sessionStorage.getItem("quiz.total") || 10);
  const currentMode = getInitialMode(); // mode that was just played

  function playAgain() {
    // compute & persist next mode
    const next = computeNextMode(currentMode);
    setNextMode(next);

    // clear round state
    sessionStorage.setItem("quiz.score", "0");
    sessionStorage.removeItem("quiz.answers");

    // relaunch quiz in SPA (no full reload)
    navigate("/quiz", { replace: true });
  }

  return (
    <section className="results">
      <div className="card results-card">
        {/* Imagen en lugar del emoji */}
        <div className="result-hero">
          <img 
            src={congratsImg} 
            alt="Congratulations" 
            style={{ width: "120px", height: "auto" }} 
          />
        </div>

        <h2 className="subtitle center-text m0" style={{ marginBottom: 8 }}>
          Congratulations, Player! You finished the quiz.
        </h2>

        <p className="center-text muted" style={{ marginBottom: 24 }}>
          You answered {score}/{total} correctly.
        </p>

        <button className="btn" onClick={playAgain}>
          Play Again
        </button>
      </div>
    </section>
  );
}






