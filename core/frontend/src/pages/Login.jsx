import React, {useState} from 'react'
import axios from 'axios';
import '../css/AuthPage.css'

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin(event) {
    event.preventDefault();

    axios.post('http://localhost:8000/api/login/', { username, password })
      .then(response => {
        console.log('Logged in! Token:', response.data.token);
        alert("Login successful!");
        //save token
      })
      .catch(err => {
        console.error('Login error', err);
        alert("Login failed. Check username and password.");
      });
  }

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