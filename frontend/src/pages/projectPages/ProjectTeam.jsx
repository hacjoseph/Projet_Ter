import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    FiBook,
    FiUsers,
    FiUser,
    FiBookmark,
    FiLoader,
    FiAlertCircle,
    FiUserPlus
} from 'react-icons/fi';
import axios from 'axios';

const ProjectsTeam = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingAssign, setLoadingAssign] = useState(false);
    const [error, setError] = useState(null);
    const [resetBeforeAssign, setResetBeforeAssign] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    const fetchData = async () => {
            setLoading(true);
            try {

                const response = await api.get("/projects-with-teams/");

                setData(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Erreur de chargement');
            } finally {
                setLoading(false);
            }
        };


    useEffect(() => {
        fetchData();
    }, []);

    const handleAssignGroupes = async () => {
        try {
            setLoadingAssign(true);
            setError(null);

            await api.post('/assign-student-team/', {
                reset: resetBeforeAssign
            });

            setSuccessMessage("Attribution des groupes réussie ✅");
            fetchData()
            // window.location.reload(); // Solution simple en attendant
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'attribution des groupes");
        } finally {
            setLoadingAssign(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <FiLoader className="animate-spin h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
        );
    }

    {
        successMessage && (
            <div className="mt-4 p-2 text-green-700 bg-green-100 border border-green-300 rounded">
                {successMessage}
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 flex-col text-red-500 dark:text-red-400">
                <FiAlertCircle className="h-8 w-8 mb-2" />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center">
                        <FiBook className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-2" />
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            {user?.role === 'student' ? 'Mes Équipes' : 'Gestion des Projets'}
                        </h1>
                    </div>

                    {user?.role === 'admin' && (
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="reset-toggle"
                                    checked={resetBeforeAssign}
                                    onChange={(e) => setResetBeforeAssign(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 dark:text-blue-500 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700"
                                />
                                <label htmlFor="reset-toggle" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    Réinitialiser avant attribution
                                </label>
                            </div>

                            <button
                                onClick={handleAssignGroupes}
                                disabled={loadingAssign}
                                className={`flex items-center px-4 py-2 rounded-md text-white transition-colors ${loadingAssign
                                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-sm'
                                    }`}
                            >
                                {loadingAssign ? (
                                    <span className="flex items-center">
                                        <FiLoader className="animate-spin mr-2" />
                                        Attribution en cours...
                                    </span>
                                ) : (
                                    <>
                                        <FiUserPlus className="mr-2" />
                                        Attribuer les groupes
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {user?.role === 'admin'
                        ? 'Vue complète de tous les projets'
                        : user?.role === 'supervisor'
                            ? 'Vos projets supervisés'
                            : 'Vos participations aux projets'}
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {user?.role === 'student' ? (
                    <StudentTeamsView data={data} />
                ) : (
                    <ProjectsListView data={data} userRole={user.role} />
                )}
            </div>
        </div>
    );
};

const ProjectsListView = ({ data, userRole }) => {
    if (!data?.projects?.length) {
        return (
            <div className="text-center p-12">
                <FiBook className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
                <h3 className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">Aucun projet disponible</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {userRole === 'admin'
                        ? 'Créez votre premier projet'
                        : 'Aucun projet ne vous est assigné'}
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.projects.map((project) => (
                <ProjectCard key={project.project_id} project={project} />
            ))}
        </div>
    );
};

const ProjectCard = ({ project }) => {
    return (
        <div className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                        <FiBookmark className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{project.project_title}</h3>
                        <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <FiUser className="mr-1" />
                            <span>{project.supervisor}</span>
                            <span className="mx-2">•</span>
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-xs">
                                {project.project_code}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 ml-14">
                {project.teams.length > 0 ? (
                    <div className="space-y-3">
                        {project.teams.map((team) => (
                            <TeamCard key={team.id} team={team} />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 py-3">
                        <FiUsers className="mr-2 text-gray-400 dark:text-gray-500" />
                        Aucune équipe sur ce projet
                    </div>
                )}
            </div>
        </div>
    );
};

const TeamCard = ({ team }) => {
    const capacityPercentage = Math.round((team.students.length / team.max_students) * 100);

    return (
        <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 shadow-xs dark:shadow-none">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                    <FiUsers className="h-4 w-4 text-indigo-500 dark:text-indigo-400 mr-2" />
                    <span className="font-medium text-sm dark:text-white">{team.name}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${team.students.length < team.min_students
                        ? 'bg-red-100 dark:bg-red-900/50 text-red-400 dark:text-red-300'
                        : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                    }`}>
                    {team.students.length}/{team.max_students} membres
                </span>
            </div>

            <div className="mb-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                    <div
                        className={`h-1.5 rounded-full ${capacityPercentage >= 90
                                ? 'bg-green-400 dark:bg-green-500'
                                : capacityPercentage >= 50
                                    ? 'bg-amber-400 dark:bg-amber-500'
                                    : 'bg-red-400 dark:bg-red-500'
                            }`}
                        style={{ width: `${capacityPercentage}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Capacité: {capacityPercentage}%</span>
                    <span>Minimum: {team.min_students}</span>
                </div>
            </div>

            <div>
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">MEMBRES</h4>
                <div className="flex flex-wrap gap-2">
                    {team.students.map((student) => (
                        <div key={student.id} className="flex items-center">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-1">
                                <FiUser className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                            </div>
                            <span className="text-xs font-medium dark:text-white">{student.full_name ? student.full_name : student.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StudentTeamsView = ({ data }) => {
    if (!data?.teams?.length) {
        return (
            <div className="text-center p-12">
                <FiUsers className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
                <h3 className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">Aucune équipe</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Vous ne faites partie d'aucune équipe actuellement
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.teams.map((team) => (
                <div key={team.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                            <FiUsers className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">{team.name}</h3>

                            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <FiBook className="mr-1.5" />
                                <span className="font-medium">{team.project_name}</span>
                                <span className="mx-2">•</span>
                                <FiUser className="mr-1.5" />
                                <span>{team.supervisor}</span>
                            </div>

                            <div className="mt-3">
                                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">MEMBRES DE L'ÉQUIPE</h4>
                                <div className="flex flex-wrap gap-2">
                                    {team.students.map((student) => (
                                        <div key={student.id} className="flex items-center bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                                            <FiUser className="h-3 w-3 text-gray-500 dark:text-gray-400 mr-1" />
                                            <span className="text-xs font-medium dark:text-white">{student.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProjectsTeam;