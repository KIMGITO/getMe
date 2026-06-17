// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/theme.css';
import App from './App.tsx';

// Add this single line to make dark theme default
document.documentElement.classList.add('dark');
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
