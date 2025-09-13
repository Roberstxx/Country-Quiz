export default function Bubble({ number, active=false, onClick }){
  return (
    <button
      type="button"
      className={`bubble ${active ? "active" : ""}`}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
    >
      {number}
    </button>
  );
}
