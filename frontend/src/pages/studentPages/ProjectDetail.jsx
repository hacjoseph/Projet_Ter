import { useParams, useNavigate } from 'react-router-dom';
import StudentNavBar from '../../components/StudentNavBar';
import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../../api/axios';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                // Remplacez cette URL par votre vrai endpoint API
                const response = await api.get(`/projects/${id}/`);
                setProject(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

        if (loading) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-gray-700 dark:text-gray-300">Chargement...</div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-red-500 dark:text-red-400">Erreur: {error}</div>
        </div>
    );
    
    if (!project) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-gray-700 dark:text-gray-300">Projet non trouvé</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour à la liste
                </button>

                <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-md dark:shadow-gray-700/50">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4 mb-6">
                        <div>
                            <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium mb-3">
                                {project.code}
                            </span>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h1>
                            <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                                Niveau: {project.level}
                            </span>
                        </div>
                    </div>

                    <div className="prose max-w-none mb-8 dark:prose-invert">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Description du projet</h2>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{project.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Encadrant</h3>
                            <div className="flex items-center">
                                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-3">
                                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-500 dark:text-gray-300">{project.supervisor.username}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{project.supervisor.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Détails pratiques</h3>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className='text-gray-500 dark:text-gray-400'>Nombre de groupes: <span className="font-medium">{project.number_groups}</span></span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className='text-gray-500 dark:text-gray-400'>Période: <span className="font-medium">Semestre 2</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={() => navigate('/voeux')}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
                        >
                            Ajouter à mes vœux
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;