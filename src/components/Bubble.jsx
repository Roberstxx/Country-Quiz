// src/components/Bubble.jsx
export default function Bubble({ number, active = false, answered = false, onClick }) {
  const cls =
    "bubble" +
    (active ? " active" : "") +
    (answered ? " answered" : "");

  return {
    /* button to navigate between questions */
  } && (
    <button
      type="button"
      className={cls}
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Pregunta ${number}${active ? " (actual)" : ""}${answered ? " (respondida)" : ""}`}
    >
      {number}
    </button>
  );
}

