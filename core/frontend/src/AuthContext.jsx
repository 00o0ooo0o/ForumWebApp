import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); 
    const [username, setUsername] = useState('');

    const checkAuth = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/check-auth/', {
                withCredentials: true,
            });
            setIsAuthenticated(true);
            setUsername(res.data.username);
        } catch (err) {
            setIsAuthenticated(false);
            setUsername('');
        }
    };

    const login = async (username, password) => {
        await axios.post(
            'http://localhost:8000/api/login/',
            { username, password },
            { withCredentials: true }
        );
        await checkAuth(); 
    };

    const logout = async () => {
        await axios.post('http://localhost:8000/api/logout/', {}, { withCredentials: true });
        setIsAuthenticated(false);
        setUsername('');
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
