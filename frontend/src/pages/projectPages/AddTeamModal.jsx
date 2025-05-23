import React from 'react';
import { FiX } from 'react-icons/fi';

const TeamCreationModal = ({
    isOpen,
    onClose,
    project,
    formData,
    onChange,
    onSubmit
}) => {
    if (!isOpen || !project) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Créer un groupe pour {project.code}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                            Nom du groupe
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={onChange}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: Groupe A"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                Étudiants min
                            </label>
                            <input
                                type="number"
                                name="min_students"
                                min="1"
                                max={project.number_groups}
                                value={formData.min_students}
                                onChange={onChange}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                Étudiants max
                            </label>
                            <input
                                type="number"
                                name="max_students"
                                min={formData.min_students}
                                max={project.number_groups}
                                value={formData.max_students}
                                onChange={onChange}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800 rounded-md"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={!formData.name || formData.min_students > formData.max_students}
                        className={`px-4 py-2 rounded-md text-white ${!formData.name || formData.min_students > formData.max_students
                                ? 'bg-blue-300 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamCreationModal;