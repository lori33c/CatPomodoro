import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// --- Service Worker registration (for background notifications) ---
if ('serviceWorker' in navigator) {
  // Wait for the page to load so CRA's dev server doesn’t fight with registration.
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => {
        // Optional: listen for updates so you can prompt users to refresh
        reg.onupdatefound = () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.onstatechange = () => {
            if (installing.state === 'installed') {
              // New content is available; you could show a toast here.
              // console.log('Service worker installed/updated.');
            }
          };
        };
      })
      .catch(err => {
        console.warn('SW registration failed:', err);
      });
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
