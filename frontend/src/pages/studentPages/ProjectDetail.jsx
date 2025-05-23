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

    if (loading) return <div>Chargement...</div>;
    if (error) return <div>Erreur: {error}</div>;
    if (!project) return <div>Projet non trouvé</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* <StudentNavBar /> */}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour à la liste
                </button>

                <div className="bg-white p-8 rounded-xl shadow-md">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-3">
                                {project.code}
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                Niveau: {project.level}
                            </span>
                        </div>
                    </div>

                    <div className="prose max-w-none mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Description du projet</h2>
                        <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-3">Encadrant</h3>
                            <div className="flex items-center">
                                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-500">{project.supervisor.username}</p>
                                    <p className="text-sm text-gray-600">{project.supervisor.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-3">Détails pratiques</h3>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className='text-gray-500'>Nombre de groupes: <span className="font-medium">{project.number_groups}</span></span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className='text-gray-500'>Période: <span className="font-medium">Semestre 2</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={() => navigate('/voeux')}
                            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
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