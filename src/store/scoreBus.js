// Sencillo bus de eventos para avisar cambios de score en la MISMA pestaña
export const scoreBus = new EventTarget();

// Lectura consistente del score de la ronda actual
export function getRoundScore() {
  try {
    const round = JSON.parse(sessionStorage.getItem("quiz.round") || "{}");
    const answers = JSON.parse(sessionStorage.getItem("quiz.answers") || "{}");
    const ids = Array.isArray(round.ids) ? round.ids : [];
    const currentMode = round.mode;

    let score = 0;
    for (const id of ids) {
      const a = answers[id];
      if (a && a.correct && a.mode === currentMode) score++;
    }

    const total = Number(sessionStorage.getItem("quiz.total")) || ids.length || 10;
    return { score, total, mode: currentMode || "flag" };
  } catch {
    return { score: 0, total: 10, mode: "flag" };
  }
}
