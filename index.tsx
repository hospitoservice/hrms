import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ThemeService from './service/ThemeService';

// Apply the saved/OS theme before the first paint to avoid a light-mode flash.
ThemeService.init();

// Register service worker only in production builds.
// Vite dev server is incompatible with SW caching (HMR, virtual modules).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);