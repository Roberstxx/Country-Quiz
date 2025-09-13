import { computeNextMode, getInitialMode, setNextMode } from "/src/utils/modes.js";
const USER_KEY = "quiz.username";

export default function Results(){
  const username = localStorage.getItem(USER_KEY) || "Player";
  const score = Number(sessionStorage.getItem("quiz.score") || 0);
  const currentMode = getInitialMode(); // el que se jugó (persistido antes del quiz)

  function playAgain(){
    // calcula y guarda el siguiente modo
    const next = computeNextMode(currentMode);
    setNextMode(next);

    // limpia estado de la ronda terminada
    sessionStorage.setItem("quiz.score", "0");
    sessionStorage.removeItem("quiz.answers");

    // relanza el quiz (cargará el nuevo modo automáticamente)
    window.location.href = "/quiz";
  }

  return (
    <section className="results">
      <div className="card results-card">
        <div className="result-hero" role="img" aria-label="Confetti">🎉</div>
        <h2 className="subtitle center-text m0" style={{marginBottom:8}}>
          ¡Felicidades, {username}! Completaste el cuestionario.
        </h2>
        <p className="center-text muted" style={{marginBottom:24}}>
          Respondiste {score}/10 correctamente.
        </p>
        <button className="btn" onClick={playAgain}>Jugar de nuevo</button>
      </div>
    </section>
  );
}

