import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/about" element={<h2>About</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;