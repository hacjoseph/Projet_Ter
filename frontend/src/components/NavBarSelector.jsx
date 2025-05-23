import React from 'react';
import AdminNavBar from './AdminNavBar';
import SupervisorNavBar from './SupervisorNavBar';
import StudentNavBar from './StudentNavBar';
import { useAuth } from '../context/AuthContext';

const NavBarSelector = () => {
    const { user} = useAuth();

    switch (user?.role) {
        case 'admin':
            return <AdminNavBar />;
        case 'supervisor':
            return <SupervisorNavBar />;
        case 'student':
            return < StudentNavBar />
        default:
            return null;
    }
};

export default NavBarSelector;