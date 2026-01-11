import React, { useState, useContext} from 'react'
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/AuthPage.css'

export function Login({ closeModal, onLoginSuccess }) {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
      event.preventDefault();
      try {
          await login(username, password);
          alert('Login successful!');
          closeModal();
          navigate("/member", { replace: true });
      } catch (err) {
          console.error('Login error', err);
          setError('Login failed. Check username and password.');
      }
  };



  return (
    <div className="Auth">
      <h1>Log In</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}