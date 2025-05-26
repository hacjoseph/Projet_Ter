import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    // Charger la liste des projets
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await api.get('/projects/');
                setProjects(response.data);
            } catch (error) {
                console.error('Erreur lors du chargement des projets', error);
            }
        };
        fetchProjects();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Liste des projets disponibles</h1>
                    <button
                        onClick={() => navigate('/voeux')}
                        className="px-4 py-2 md:px-6 md:py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
                    >
                        Exprimer mes vœux
                    </button>
                </div>

                <div className="space-y-6">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg dark:hover:shadow-gray-700/50 transition-shadow border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4">
                                <div className="flex-1">
                                    <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium mb-2">
                                        {project.code}
                                    </span>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">{project.title}</h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{project.description}</p>
                                </div>
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium whitespace-nowrap">
                                    Niveau: {project.level}
                                </span>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            Encadrant: <span className="font-medium">{project.supervisor.username}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            Nombres de groupes: <span className="font-medium">{project.number_groups}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            Contact: <span className="font-medium">{project.supervisor.email}</span>
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/projets/${project.id}`)}
                                    className="px-4 py-2 bg-white dark:bg-gray-700 border border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Voir les détails
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectList;