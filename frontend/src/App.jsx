import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Home Page ✅</h1>} />
        <Route path="/test" element={<h1>Test Page ✅</h1>} />
      </Routes>
    </Router>
  );
}

export default App;

