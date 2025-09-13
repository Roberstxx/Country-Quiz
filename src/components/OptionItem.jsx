export default function OptionItem({ text, state="idle", onClick, disabled=false }){
  // state: "idle" | "selected" | "correct" | "wrong"
  return (
    <button
      type="button"
      className={`option ${state !== "idle" ? state : ""}`}
      onClick={onClick}
      disabled={disabled}
      role="radio"
      aria-checked={state === "selected" || state === "correct"}
    >
      {text}
    </button>
  );
}
