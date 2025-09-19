// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "/src/components/Header.jsx";
import Footer from "/src/components/Footer.jsx";

import Quiz from "/src/pages/Quiz.jsx";
import Results from "/src/pages/Results.jsx";

export default function App(){
  return (
    <div className="app">
      <Header />
      <main className="main container">
        <Routes>
          <Route path="/" element={<Navigate to="/quiz" replace />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/results" element={<Results />} />
          <Route path="*" element={<Navigate to="/quiz" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
