import React from 'react';
import { hydrate, render } from "react-dom";
import './index.css';
import App from './App';

// Import Inter font weights
import '@fontsource/inter/400.css';  // Regular
import '@fontsource/inter/500.css';  // Medium
import '@fontsource/inter/600.css';  // Semi-Bold
import '@fontsource/inter/700.css';  // Bold
import '@fontsource/inter/800.css';  // Extra-Bold
import '@fontsource/inter/900.css';  // Black

const rootElement = document.getElementById("root");

if (rootElement.hasChildNodes()) {
  hydrate(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    rootElement
  );
} else {
  render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    rootElement
  );
}