import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './index.css';

// Import Inter font weights
import '@fontsource/inter/400.css';  // Regular
import '@fontsource/inter/500.css';  // Medium
import '@fontsource/inter/600.css';  // Semi-Bold
import '@fontsource/inter/700.css';  // Bold
import '@fontsource/inter/800.css';  // Extra-Bold
import '@fontsource/inter/900.css';  // Black

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);