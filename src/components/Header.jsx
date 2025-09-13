import { Link, useLocation } from "react-router-dom";
import ScorePill from "/src/components/ScorePill.jsx";

export default function Header(){
  const loc = useLocation();
  const showScore = loc.pathname === "/quiz" || loc.pathname === "/results";
  return (
    <header className="header">
      <div className="container row space-between center">
        <Link to="/" className="brand">Country Quiz</Link>
        {showScore && <ScorePill />}
      </div>
    </header>
  );
}
