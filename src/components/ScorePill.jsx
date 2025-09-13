import { useEffect, useState } from "react";

export default function ScorePill(){
  const [score, setScore] = useState(0);
  useEffect(()=>{
    const handler = () => {
      const s = Number(sessionStorage.getItem("quiz.score") || 0);
      setScore(s);
    };
    handler();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  },[]);
  return <div className="score-pill" aria-label="Puntaje actual">🏆 {score}/10 Points</div>;
}
