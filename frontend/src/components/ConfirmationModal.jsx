import React, { useEffect } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirmation",
    message = "Êtes-vous sûr de vouloir effectuer cette action ?",
    confirmText = "Confirmer",
    cancelText = "Annuler",
    confirmColor = "blue",
    icon = "warning" // 'warning', 'danger', 'info', 'success'
}) => {
    // Empêche le défilement de la page quand la modal est ouverte
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const iconConfig = {
        warning: {
            icon: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />,
            bg: "bg-yellow-100 dark:bg-yellow-900/30",
            text: "text-yellow-600 dark:text-yellow-400"
        },
        danger: {
            icon: <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />,
            bg: "bg-red-100 dark:bg-red-900/30",
            text: "text-red-600 dark:text-red-400"
        },
        info: {
            icon: <ExclamationTriangleIcon className="h-6 w-6 text-blue-500" />,
            bg: "bg-blue-100 dark:bg-blue-900/30",
            text: "text-blue-600 dark:text-blue-400"
        },
        success: {
            icon: <ExclamationTriangleIcon className="h-6 w-6 text-green-500" />,
            bg: "bg-green-100 dark:bg-green-900/30",
            text: "text-green-600 dark:text-green-400"
        }
    };

    const colorClasses = {
        red: "bg-red-600 hover:bg-red-700 focus-visible:outline-red-600",
        blue: "bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600",
        green: "bg-green-600 hover:bg-green-700 focus-visible:outline-green-600",
        yellow: "bg-yellow-600 hover:bg-yellow-700 focus-visible:outline-yellow-600"
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay avec animation */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
                aria-hidden="true"
                onClick={onClose}
            ></div>

            {/* Modal avec animation */}
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    {/* Header */}
                    <div className={`flex items-start justify-between p-4 ${iconConfig[icon].bg} rounded-t-lg`}>
                        <div className="flex items-center">
                            <div className={`flex-shrink-0 ${iconConfig[icon].text}`}>
                                {iconConfig[icon].icon}
                            </div>
                            <h3 className={`ml-3 text-lg font-semibold ${iconConfig[icon].text}`}>
                                {title}
                            </h3>
                        </div>
                        <button
                            type="button"
                            className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={onClose}
                        >
                            <span className="sr-only">Fermer</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Contenu */}
                    <div className="px-4 py-5 sm:p-6">
                        <p className="text-gray-700 dark:text-gray-300">{message}</p>
                    </div>

                    {/* Footer avec boutons */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 rounded-b-lg">
                        <button
                            type="button"
                            className={`inline-flex w-full justify-center rounded-md px-4 py-2 text-white shadow-sm transition-all sm:ml-3 sm:w-auto ${colorClasses[confirmColor]} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${confirmColor}-500`}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                        <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-600 px-4 py-2 text-gray-700 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all sm:mt-0 sm:w-auto focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;