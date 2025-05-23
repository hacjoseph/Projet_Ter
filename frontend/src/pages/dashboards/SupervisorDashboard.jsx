import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SupervisorNavBar from '../../components/SupervisorNavBar';

const SupervisorDashboard = () => {
    const { user, signOut } = useAuth();
    return (
        <div>
            {/* < SupervisorNavBar /> */}
            <h1>Tableau de bord de Encadrant</h1>
            <p>Bienvenue, {user ? user.username : 'Guest'}!</p>
        </div>
    );
};

export default SupervisorDashboard;