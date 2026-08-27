import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './i18n/index';
import './index.css';
import App from './App.jsx';
import { initGA } from './utils/analytics';

// Initialize Google Analytics
initGA();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
