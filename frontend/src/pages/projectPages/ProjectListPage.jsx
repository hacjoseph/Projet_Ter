import React, { useCallback, useEffect, useState } from 'react';
import ProjectCard from './ProjectCard';
import AddTeamModal from './AddTeamModal';
import AddProjectModal from './AddProjectModal'
import EditProjectModal from './EditProjectModal'
import api from '../../api/axios';
import SupervisorNavBar from '../../components/SupervisorNavBar';
import ConfirmationModal from '../../components/ConfirmationModal';

const ProjectListPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState("");
    const [projectToDelete, setProjectToDelete] = useState(null);

    const [editModal, setEditModal] = useState({
        isOpen: false,
        projectId: null
    });

    const [modalState, setModalState] = useState({
        isOpen: false,
        project: null,
        formData: { name: '', min_students: 1, max_students: 1 }
    });

    const fetchProjects = async () => {
        try {
            const [projectsRes, teamsRes] = await Promise.all([
                api.get('/projects/', {
                    params: selectedLevel ? { level: selectedLevel } : {},
                }),
                api.get('/teams/')
            ]);

            // Regroupement des groupes par projet
            const teamsByProject = teamsRes.data.reduce((acc, team) => {
                acc[team.project] = acc[team.project] || [];
                acc[team.project].push(team);
                return acc;
            }, {});

            const mergedData = projectsRes.data.map(project => ({
                ...project,
                teams: teamsByProject[project.id] || []
            }));

            setProjects(mergedData);
            setLoading(false);
        } catch (error) {
            console.error('Echec de chargement des projets', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [selectedLevel]);

    // Fonction pour supprimer un projet
    const handleDeleteProject = async () => {
        if (!projectToDelete) return;
        
        try {
            await api.delete(`/projects/${projectToDelete}/`);
            setProjects(projects.filter(project => project.id !== projectToDelete));
            setProjectToDelete(null);
            fetchProjects();
        } catch (error) {
            console.error('Erreur projet non supprimé', error);
        }
    };

    // Gestion du modal
    const openTeamModal = (project) => {
        setModalState({
            isOpen: true,
            project,
            formData: {
                name: '',
                min_students: 1,
                max_students: project.number_groups
            }
        });
    };

    // Gestion de la modal de projet
    const openProjectModal = () => {
        setIsProjectModalOpen(true);
    };

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setModalState(prev => ({
            ...prev,
            formData: {
                ...prev.formData,
                [name]: name === 'name' ? value : parseInt(value)
            }
        }));
    };

    const handleUpdateProject = (updatedProject) => {
        setProjects(projects.map(proj =>
            proj.id === updatedProject.id ? updatedProject : proj
        ));
    };

    const openEditModal = (projectId) => {
        setEditModal({
            isOpen: true,
            projectId: projectId
        });
    };

    const handleSubmit = async () => {
        try {
            await api.post(`/teams/`, {
                ...modalState.formData,
                project: modalState.project.id
            });
            closeModal();
            fetchProjects(); // Recharger les projets après création
        } catch (error) {
            console.error("Erreur création d'équipe:", error.response?.data);
        }
    };

    const handleProjectSubmit = async (projectData) => {
        try {
            await api.post('/projects/', projectData);
            fetchProjects();
        } catch (error) {
            console.error("Erreur création de projet:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Liste des Projets</h1>
                    <div className="flex space-x-4">
                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="">Tous les niveaux</option>
                            <option value="L2">Licence 2</option>
                            <option value="L3">Licence 3</option>
                            <option value="M1">Master 1</option>
                        </select>
                        <button
                            onClick={openProjectModal}
                            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                        >
                            + Créer un projet
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">Chargement en cours...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {projects.length > 0 ? (
                            projects.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onEdit={openEditModal}
                                    onDelete={() => setProjectToDelete(project.id)}
                                    projectId={project.id}
                                    onAddTeam={() => openTeamModal(project)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 shadow bg-white dark:bg-gray-800 rounded-lg">
                                <h3 className={"mt-3 text-lg font-medium dark:text-gray-200 text-gray-700"}>
                                Aucun projet trouvé pour ce niveau
                            </h3>
                                <p className="text-gray-500 text-lg">Aucun projet disponible</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de confirmation de suppression */}
            <ConfirmationModal
                isOpen={!!projectToDelete}
                onClose={() => setProjectToDelete(null)}
                onConfirm={handleDeleteProject}
                title="Confirmer la suppression"
                message="Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible."
                confirmText="Supprimer"
                cancelText="Annuler"
                confirmColor="red"
            />

            <AddTeamModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                project={modalState.project}
                formData={modalState.formData}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
            />

            <AddProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onSubmit={handleProjectSubmit}
            />

            <EditProjectModal
                isOpen={editModal.isOpen}
                onClose={() => setEditModal({ isOpen: false, projectId: null })}
                projectId={editModal.projectId}
                onProjectUpdated={handleUpdateProject}
            />
        </div>
    );
};

export default ProjectListPage;