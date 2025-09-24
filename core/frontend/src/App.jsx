import React from 'react'
import { Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Layout } from './components/Layout';
import './css/App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}> 
          <Route index element={<Home />} />
          <Route path='*' element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;