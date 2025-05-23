import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({children}) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Vous pouvez remplacer par un spinner
    }

    return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;