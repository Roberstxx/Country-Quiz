import { Routes, Route, Navigate } from "react-router-dom";
import Header from "/src/components/Header.jsx";
import Footer from "/src/components/Footer.jsx";
import Intro from "/src/pages/Intro.jsx";
import Quiz from "/src/pages/Quiz.jsx";
import Results from "/src/pages/Results.jsx";

export default function App(){
  return (
    <div className="app">
      <Header />
      <main className="main container">
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/results" element={<Results />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
