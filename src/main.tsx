import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function startApp() {
  try {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to start the application:', error);
    document.body.innerHTML = '<h1>Failed to load the application. Please try again later.</h1>';
  }
}

startApp();
