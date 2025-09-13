import CheckIcon from "../assets/icons/check.svg";
import CrossIcon from "../assets/icons/cross.svg";

export default function OptionItem({
  text,
  state = "idle", // "idle" | "selected" | "correct" | "wrong"
  onClick,
  disabled = false,
}) {
  const showBadge = state === "correct" || state === "wrong";
  const badgeIcon = state === "correct" ? CheckIcon : CrossIcon;

  return (
    <button
      type="button"
      className={`option ${state !== "idle" ? state : ""}`}
      onClick={onClick}
      disabled={disabled}
      role="radio"
      aria-checked={state === "selected" || state === "correct"}
    >
      <span className="option__label">{text}</span>

      {showBadge && (
        <span
          className={`option__badge ${
            state === "correct" ? "is-correct" : "is-wrong"
          }`}
          aria-hidden="true"
        >
          <img src={badgeIcon} alt="" />
        </span>
      )}
    </button>
  );
}
