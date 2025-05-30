import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
window.onerror = function (message, source, lineno, colno, error) {
  console.log("🔥 Global Error Handler:", message, source, lineno, colno, error);
};

window.addEventListener("unhandledrejection", function (event) {
  console.log("💥 Unhandled Rejection:", event.reason);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
