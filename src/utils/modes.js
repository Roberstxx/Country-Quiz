export const MODE_ORDER = ["flag", "capital", "region", "currency", "language"];
const NEXT_KEY = "quiz.nextMode";

export function getInitialMode() {
  // Si no hay preferencia guardada, arranca por banderas
  return sessionStorage.getItem(NEXT_KEY) || MODE_ORDER[0];
}

export function computeNextMode(current) {
  const idx = MODE_ORDER.indexOf(current);
  if (idx === -1) return MODE_ORDER[0];
  return MODE_ORDER[(idx + 1) % MODE_ORDER.length];
}

export function setNextMode(mode) {
  sessionStorage.setItem(NEXT_KEY, mode);
}
