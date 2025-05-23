import React from 'react';
import { useForm } from 'react-hook-form';

const AddProjectModal = ({ isOpen, onClose, onSubmit }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const handleFormSubmit = (data) => {
        onSubmit(data);
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Créer un nouveau projet</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Colonne de gauche */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                        Code du projet <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register("code", { required: "Ce champ est obligatoire" })}
                                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.code ? "border-red-500" : "border-gray-300"
                                            }`}
                                    />
                                    {errors.code && (
                                        <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                        Titre du projet <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register("title", { required: "Ce champ est obligatoire" })}
                                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.title ? "border-red-500" : "border-gray-300"
                                            }`}
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                        Niveau <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register("level", { required: "Ce champ est obligatoire" })}
                                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.level ? "border-red-500" : "border-gray-300"
                                            }`}
                                    >
                                        <option value="L3">Licence 3</option>
                                        <option value="M1">Master 1</option>
                                        <option value="M2">Master 2</option>
                                    </select>
                                    {errors.level && (
                                        <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Colonne de droite */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                        Nombre de groupes <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        {...register("number_groups", {
                                            required: "Ce champ est obligatoire",
                                            min: { value: 1, message: "Minimum 1 groupe" }
                                        })}
                                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.number_groups ? "border-red-500" : "border-gray-300"
                                            }`}
                                        min="1"
                                    />
                                    {errors.number_groups && (
                                        <p className="mt-1 text-sm text-red-600">{errors.number_groups.message}</p>
                                    )}
                                </div>

                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Encadrant (email) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        {...register("supervisor_email", {
                                            required: "Ce champ est obligatoire",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Email invalide"
                                            }
                                        })}
                                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.supervisor_email ? "border-red-500" : "border-gray-300"
                                            }`}
                                    />
                                    {errors.supervisor_email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.supervisor_email.message}</p>
                                    )}
                                </div> */}
                            </div>
                        </div>

                        {/* Description (pleine largeur) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                                Description du projet
                            </label>
                            <textarea
                                {...register("description")}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-white dark:hover:bg-gray-800 hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Créer le projet
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProjectModal;