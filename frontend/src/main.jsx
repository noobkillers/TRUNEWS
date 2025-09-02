import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";   // ✅ make sure this file exists
import "./index.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);