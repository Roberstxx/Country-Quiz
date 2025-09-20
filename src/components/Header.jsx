// src/components/Header.jsx
import { Link } from "react-router-dom";
import { useRoundScore } from "/src/hooks/useRoundScore.js";

export default function Header(){
  const { score, total } = useRoundScore(); // ← reactivo

  return (
    <header className="header">
      <div className="container row space-between center">
        <Link to="/" className="brand">Country Quiz</Link>

        {/* Pastilla con la copa + score */}
        <div className="score-pill" aria-live="polite">
          🏆 {score} / {total}
        </div>
      </div>
    </header>
  );
}
