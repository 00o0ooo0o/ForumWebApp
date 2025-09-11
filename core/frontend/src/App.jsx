import React from 'react'
import { Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/HomePage';
import { Login } from './pages/LoginPage';
import { Signup } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Layout } from './components/Layout';
import './App.css'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}> 
          <Route index element={<Home />} />
          <Route path='login' element={<Login />} />
          <Route path='register' element={<Signup />} />
          <Route path='*' element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;