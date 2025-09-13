import { useState } from "react";
import { useNavigate } from "react-router-dom";
const USER_KEY = "quiz.username";

export default function Intro(){
  const navigate = useNavigate();
  const [name, setName] = useState(localStorage.getItem(USER_KEY) || "");

  function start(){
    const n = name.trim();
    if(n) localStorage.setItem(USER_KEY, n);
    // resetea score y progreso por si vuelven a empezar
    sessionStorage.setItem("quiz.score", "0");
    sessionStorage.removeItem("quiz.answers");
    navigate("/quiz");
  }

  return (
    <section className="intro">
      <div className="card" role="region" aria-label="Introducción">
        <h1 className="title">Cuestionario de países</h1>
        <p className="muted">Pon tu nombre y juega una ronda de <strong>10 preguntas</strong> sobre banderas, capitales y regiones.</p>

        <label className="label" htmlFor="username">
          <span className="label-text">Tu nombre (opcional)</span>
          <input
            id="username"
            className="input"
            placeholder="Escribe tu nombre"
            value={name}
            onChange={(e)=> setName(e.target.value)}
          />
        </label>

        <button className="btn" onClick={start} aria-label="Empezar el quiz">Empezar</button>
      </div>
    </section>
  );
}


