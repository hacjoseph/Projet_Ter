
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import SupervisorDashboard from './SupervisorDashboard';

const Dashboard = () => {
    const { user} = useAuth();

    if (!user) {
        return <p>Please log in to access the dashboard.</p>;
    }

    switch (user.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'student':
            return <StudentDashboard />;
        case 'supervisor':
            return <SupervisorDashboard />;
        default:
            return <p>Role not recognized.</p>;
    }
};

export default Dashboard;