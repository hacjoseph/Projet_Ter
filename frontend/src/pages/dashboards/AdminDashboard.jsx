import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminNavBar from '../../components/AdminNavBar'

const AdminDashboard = () => {
    const { user, signOut } = useAuth();

    return (
        <div className="justify-center text-white text-2xl font-bold">
            {/* <AdminNavBar /> */}
            <h1>Admin Dashboard</h1>
            
            {/* Ajoutez ici le contenu spécifique à l'administrateur */}
        </div>
    );
};

export default AdminDashboard;