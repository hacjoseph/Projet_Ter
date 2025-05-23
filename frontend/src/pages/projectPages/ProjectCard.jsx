import React from 'react';
import { FiPlus, FiUser, FiAward, FiFlag, FiUsers, FiInfo, FiEdit2 } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const ProjectCard = ({ project, onEdit,onDelete, onAddTeam, projectId }) => {
    const { user, isAdmin } = useAuth();

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden flex flex-col h-full w-full border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-700/50 transition-shadow">
            <div className="p-6 flex-grow">
                {/* Header avec titre et badge de priorité */}
                <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {project.code} - {project.title}
                        {isAdmin && project.priority && (
                            <span className="ml-2 text-red-500 dark:text-red-400" title="Projet prioritaire">
                                <FiFlag className="inline" />
                            </span>
                        )}
                    </h2>

                    {isAdmin && project.priority && (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium rounded mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Prioritaire
                        </span>
                    )}
                </div>

                {/* Badges d'information */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                        <FiAward className="mr-1" /> {project.level}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                        <FiUsers className="mr-1" /> {project.teams?.length || 0}/{project.number_groups} groupes
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        <FiUser className="mr-1" /> {project.supervisor.username}
                    </span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                {/* Liste des groupes existants */}
                {project.teams?.length === 0 && (
                    <div className="px-5 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
                        Aucun groupe créé pour ce projet
                    </div>
                )}
                {project.teams === undefined && (
                    <div className="px-5 py-2 text-sm text-yellow-600 dark:text-yellow-400">
                        Chargement des groupes...
                    </div>
                )}

                {project.teams && project.teams.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Groupes existants :</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.teams.map(team => (
                                <span
                                    key={team.id}
                                    className="inline-block px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                >
                                    {team.name} ({team.min_students}-{team.max_students} étudiants)
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bouton d'action */}
            <div className="flex justify-end space-x-2 mt-4">
                <button
                    onClick={() => onEdit(projectId)}
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center transition-colors"
                >
                    <FiEdit2 className="mr-1" />
                    Modifier Projet
                </button>
                <button 
                        onClick={() => onDelete(project.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Supprimer
                    </button>
                <button
                    onClick={onAddTeam}
                    disabled={project.teams?.length >= project.number_groups}
                    className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${project.teams?.length >= project.number_groups
                            ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    <FiPlus className="mr-2" />
                    Ajouter un groupe
                </button>
            </div>
        </div>
    );
};

export default ProjectCard;