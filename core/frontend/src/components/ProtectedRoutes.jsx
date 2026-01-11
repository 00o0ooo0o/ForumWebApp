import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const ProtectedRoutes = () => {
    const { isAuthenticated } = useContext(AuthContext);

    if (isAuthenticated === null) return <p>Loading...</p>; 
    if (!isAuthenticated) return <Navigate to="/" replace />;

    return <Outlet />;
};

export { ProtectedRoutes };


