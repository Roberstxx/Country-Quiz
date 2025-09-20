import { useSyncExternalStore } from "react";
import { scoreBus, getRoundScore } from "/src/store/scoreBus.js";

// Hook: cada vez que se emite "score", recalcula y fuerza re-render
export function useRoundScore() {
  const subscribe = (onChange) => {
    const handler = () => onChange();
    scoreBus.addEventListener("score", handler);
    return () => scoreBus.removeEventListener("score", handler);
  };

  // Empaquetamos el snapshot como string para evitar comparaciones por referencia
  const getSnapshot = () => JSON.stringify(getRoundScore());

  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return JSON.parse(snap); // { score, total, mode }
}
