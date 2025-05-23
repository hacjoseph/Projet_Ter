import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSave, FiX, FiLoader } from 'react-icons/fi';
import api from '../../api/axios';


const EditProjectModal = ({ projectId, isOpen, onClose, onProjectUpdated }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        number_groups: 1,
        level: 'L3',
        priority: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Chargement des données quand le modal s'ouvre
    useEffect(() => {
        if (isOpen && projectId) {
            const fetchProject = async () => {
                setIsLoading(true);
                try {
                    const response = await api.get(`/projects/${projectId}/`);
                    setFormData(response.data);
                } catch (err) {
                    setError("Échec du chargement");
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProject();
        }
    }, [isOpen, projectId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.patch(
                `/projects/${projectId}/`,
                formData,
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            );
            onProjectUpdated(response.data);
            onClose();
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold">Modifier le projet</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FiX size={20} />
                    </button>
                </div>

                {isLoading && !formData ? (
                    <div className="loading-state">
                        <FiLoader className="animate-spin" />
                        <p>Chargement du projet...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p>{error}</p>
                        <button onClick={onClose}>Fermer</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                Titre
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md h-24"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                    Nombre de groupes
                                </label>
                                <input
                                    type="number"
                                    name="number_groups"
                                    min="1"
                                    value={formData.number_groups}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                    Niveau
                                </label>
                                <select
                                    name="level"
                                    value={formData.level}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="L3">L3</option>
                                    <option value="M1">M1</option>
                                    <option value="M2">M2</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="priority"
                                checked={formData.priority}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 rounded"
                            />
                            <label className="ml-2 text-sm text-gray-700 dark:text-white">
                                Projet prioritaire
                            </label>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                                disabled={isLoading}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                                disabled={isLoading || !formData}
                            >
                                {isLoading ? <FiLoader className="animate-spin" /> : <FiSave className="mr-2" />}
                                Enregistrer
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditProjectModal;