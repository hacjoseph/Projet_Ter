import React, { useState, useEffect } from 'react';
import { FiPlus, FiClock, FiCheck, FiX, FiAlertCircle, FiChevronDown } from 'react-icons/fi';
import api from '../../api/axios';

const MyChangeRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await api.get("/change-requests/");
                setRequests(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Erreur de chargement");
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    if (loading) {
        return (
            <div className={"flex items-center justify-center h-screen"}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={"flex items-center justify-center h-screen"}>
                <div className="text-center p-6 max-w-md">
                    <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400" />
                    <p className="mt-4 text-lg text-gray-900 dark:text-white">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={"min-h-screen transition-colors dark:bg-gray-900 bg-gray-50"}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className={"text-2xl font-bold dark:text-white text-gray-900"}>
                            Mes demandes de changement
                        </h1>
                        <p className={"mt-1 text-sm dark:text-gray-300 text-gray-500"}>
                            Historique de toutes vos demandes de changement de projet ou d'équipe.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={"mt-4 sm:mt-0 flex items-center px-4 py-2 rounded-md dark:bg-blue-600 dark:hover:bg-blue-700 bg-blue-500 hover:bg-blue-600 text-white"}
                    >
                        <FiPlus className="mr-2" />
                        Nouvelle demande
                    </button>
                </div>

                {/* Requests List */}
                <div className={"rounded-lg shadow overflow-hidden dark:bg-gray-800 bg-white"}>
                    {requests.length === 0 ? (
                        <div className="p-8 text-center">
                            <FiClock className={"mx-auto h-10 w-10 dark:text-gray-400 text-gray-300"} />
                            <p className={"mt-3 dark:text-gray-300 text-gray-500"}>
                                Vous n'avez aucune demande de changement de groupe ou d'équipe pour le moment
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {requests.map((req) => (
                                <RequestItem key={req.id} request={req}/>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <ChangeRequestModal
                        onClose={() => setIsModalOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

const RequestItem = ({ request}) => {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    return (
        <li className={"p-4 hover:dark:bg-gray-700  dark:bg-gray-800 bg-gray-50"}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                    <p className={"font-medium dark:text-white text-gray-900"}>
                        Projet: {request.desired_project_title || "Projet non spécifié"}
                    </p>
                    <p className={"text-sm dark:text-gray-300 text-gray-500"}>
                        Équipe: {request.desired_team_name || "Non spécifiée"}
                    </p>
                </div>
                <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                        {request.status === 'pending' && 'En attente'}
                        {request.status === 'approved' && 'Approuvé'}
                        {request.status === 'rejected' && 'Rejeté'}
                    </span>
                </div>
            </div>
            {request.reason && (
                <div className={"mt-2 p-3 rounded dark:bg-gray-700 bg-gray-50"}>
                    <p className={"text-sm dark:text-gray-300 text-gray-600"}>
                        {request.reason}
                    </p>
                </div>
            )}
        </li>
    );
};

const ChangeRequestModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
        desiredProject: '',
        desiredTeam: '',
        reason: ''
    });
    const [projects, setProjects] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsRes, teamsRes] = await Promise.all([
                    api.get("/projects/"),
                    api.get("/teams/")
                ]);
                setProjects(projectsRes.data);
                setTeams(teamsRes.data);
            } catch (err) {
                console.error("Erreur de chargement:", err);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post("/change-requests/", {
                reason: formData.reason,
                desired_project: formData.desiredProject || null,
                desired_team: formData.desiredTeam || null,
            });
            onClose();
            // Vous pourriez ajouter un toast de succès ici
            triggerToast({
                type: 'success',
                message: 'Demande envoyée avec succès !',
            });
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'envoi");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className={"rounded-lg shadow-xl w-full max-w-md bg-white dark:bg-gray-800"}>
                {/* Modal Header */}
                <div className={"flex justify-between items-center border-b p-4 'dark:'border-gray-700' border-gray-200"}>
                    <h2 className={`text-xl font-semibold dark:text-white text-gray-900 `}>
                        Nouvelle demande
                    </h2>
                    <button
                        onClick={onClose}
                        className={"p-1 rounded-full dark:hover:bg-gray-700 hover:bg-gray-100"}
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    {error && (
                        <div className={"mb-4 p-3 rounded dark:bg-red-900 dark:bg-opacity-30 dark:text-red-200 bg-red-100 text-red-700"}>
                            <FiAlertCircle className="inline mr-2" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className={"block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700"}>
                                Projet souhaité
                            </label>
                            <div className="relative">
                                <select
                                    name="desiredProject"
                                    value={formData.desiredProject}
                                    onChange={handleChange}
                                    className={"appearance-none w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900"}
                                >
                                    <option value="">-- Choisir un projet --</option>
                                    {projects.map((proj) => (
                                        <option key={proj.id} value={proj.id}>{proj.title}</option>
                                    ))}
                                </select>
                                <FiChevronDown className={"absolute right-3 top-3 dark:text-gray-400 text-gray-500"} />
                            </div>
                        </div>

                        <div>
                            <label className={"block text-sm font-medium mb-1 dark:text-gray-300 text-gray-700"}>
                                Équipe souhaitée
                            </label>
                            <div className="relative">
                                <select
                                    name="desiredTeam"
                                    value={formData.desiredTeam}
                                    onChange={handleChange}
                                    className={"appearance-none w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900"}
                                >
                                    <option value="">-- Choisir une équipe --</option>

                                    {/* Grouper les équipes par projet */}
                                    {projects.map((project) => {
                                        // Filtrer les équipes pour ce projet
                                        const projectTeams = teams.filter(team => team.project === project.id);

                                        if (projectTeams.length === 0) return null;

                                        return (
                                            <optgroup
                                                key={project.id}
                                                label={`${project.title} (${project.code})`}
                                                className={"dark:bg-gray-800 dark:text-gray-300 bg-gray-100 text-gray-900"}
                                            >
                                                {projectTeams.map((team) => (
                                                    <option
                                                        key={team.id}
                                                        value={team.id}
                                                        className={"dark:bg-gray-700 dark:hover:bg-gray-600 bg-white hover:bg-gray-100"}
                                                    >
                                                        {team.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        );
                                    })}

                                    {/* Équipes sans projet (si nécessaire) */}
                                    {teams.some(team => !team.project) && (
                                        <optgroup
                                            label="Équipes sans projet"
                                            className={"dark:bg-gray-800 dark:text-gray-300 bg-gray-100 text-gray-900"}
                                        >
                                            {teams
                                                .filter(team => !team.project)
                                                .map((team) => (
                                                    <option
                                                        key={team.id}
                                                        value={team.id}
                                                        className={"dark:bg-gray-700 dark:hover:bg-gray-600 bg-white hover:bg-gray-100"}
                                                    >
                                                        {team.name} ({team.members.length} membres)
                                                    </option>
                                                ))
                                            }
                                        </optgroup>
                                    )}
                                </select>
                                <FiChevronDown className={"absolute right-3 top-3 dark:text-gray-400 text-gray-500"} />
                            </div>
                        </div>

                        <div>
                            <label className={"block text-sm font-medium mb-1 dark:text-gray-300' text-gray-700"}>
                                Motif de la demande <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                                rows={4}
                                className={"w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900"}
                                placeholder="Expliquez les raisons de votre demande..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className={"px-4 py-2 border rounded-md dark:border-gray-600 dark:hover:bg-gray-700 border-gray-300 hover:bg-gray-50 text-gray-700 dark:text-gray-300"}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={"px-4 py-2 rounded-md flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 bg-blue-500 hover:bg-blue-600 text-white"}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Envoi...
                                    </>
                                ) : (
                                    <>
                                        <FiCheck className="mr-2" />
                                        Envoyer la demande
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MyChangeRequests;