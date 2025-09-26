import React from 'react'
import { Routes, Route, Link } from 'react-router-dom';
import { NotFoundPage } from './pages/NotFoundPage';
import { Layout } from './components/Layout';
import './css/App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;