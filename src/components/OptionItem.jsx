import CheckIcon from "../assets/icons/check.svg";
import CrossIcon from "../assets/icons/cross.svg";

export default function OptionItem({
  text,
  label,                  // opcional: por compatibilidad con llamadas previas
  state = "idle",          // puede venir "idle", "selected", "correct", "wrong",
                           // o combinaciones: "correct selected", "wrong selected"
  onClick,
  disabled = false,
}) {
  const s = String(state || "idle");

  // Estados derivados (acepta combinaciones)
  const isSelected = s.includes("selected");
  const isCorrect  = s.includes("correct");
  const isWrong    = s.includes("wrong");

  // ¿Mostramos badge?
  const showBadge  = isCorrect || isWrong;
  const badgeIcon  = isCorrect ? CheckIcon : CrossIcon;

  // aria-checked: marcada si el usuario la eligió (selected) o si es la correcta
  const ariaChecked = isSelected || isCorrect;

  return (
    <button
      type="button"
      className={`option ${s !== "idle" ? s : ""}`}
      onClick={onClick}
      disabled={disabled}
      role="radio"
      aria-checked={ariaChecked}
    >
      <span className="option__label">{text ?? label}</span>

      {showBadge && (
        <span
          className={`option__badge ${isCorrect ? "is-correct" : "is-wrong"}`}
          aria-hidden="true"
        >
          <img src={badgeIcon} alt="" />
        </span>
      )}
    </button>
  );
}

