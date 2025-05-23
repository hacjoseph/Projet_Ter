import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import StudentNavBar from '../../components/StudentNavBar';

const StudentDashboard = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 w-full">
            <div className="flex-1 flex justify-center p-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Tableau de bord de l'étudiant
                </h1>
            </div>
        </div>
    );
};

export default StudentDashboard;