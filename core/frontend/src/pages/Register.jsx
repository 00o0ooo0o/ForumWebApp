import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import axios from 'axios';
import '../css/AuthPage.css';

export function Signup({ onSwitchToLogin }) {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignup = async (event) => {
        event.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/register/', { username, email, password }, { withCredentials: true });

            await login(username, password);

            alert('Registration successful!');
            onSwitchToLogin(); 
        } catch (err) {
            console.error('Signup error', err);
            setError('Registration failed. Try a different username/email.');
        }
    };

    return (
        <div className="Auth">
            <h1>Sign Up</h1>
            <form onSubmit={handleSignup}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
                <br />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
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
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div className="header-line">
                    <h2>Already have an account?</h2>
                    <h3 onClick={onSwitchToLogin} style={{ cursor: 'pointer' }}>Log In</h3>
                </div>
            </form>
        </div>
    );
}
