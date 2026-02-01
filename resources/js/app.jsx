import "./bootstrap";
import "./echo"; // Initialize WebSocket connection
import React from "react";
import ReactDOM from "react-dom/client";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';

// Register Chart.js components globally
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

import App from "./components/App";
import ErrorBoundary from "./components/ErrorBoundary";

// Hide console errors in production
if (process.env.NODE_ENV === 'production') {
  const originalError = console.error;
  console.error = (...args) => {
    // Only log to console, don't show to users
    originalError.apply(console, args);
  };
}

// Debug: Check if root element exists
const rootElement = document.getElementById("root");
console.log('React app starting...');
console.log('Root element found:', rootElement);

if (!rootElement) {
  console.error('Root element not found! React cannot mount.');
  document.body.innerHTML = '<h1>React Error: Root element not found</h1>';
} else {
  console.log('Creating React root...');
  const root = ReactDOM.createRoot(rootElement);

  console.log('Rendering React app...');
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );

  console.log('React app rendered successfully');
}
