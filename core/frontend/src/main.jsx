import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'
import './css/index.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
    {/* Enables <App /> child components to use React Router features like <Routes> and <Route> */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
