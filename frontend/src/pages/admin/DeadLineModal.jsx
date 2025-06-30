import React, { useState, useEffect } from 'react';
import { FiCalendar, FiX, FiLoader } from 'react-icons/fi';
import api from '../../api/axios';


const DeadlineModal = ({ onClose }) => {
    const [level, setLevel] = useState("M1");
    const [deadline, setDeadline] = useState(null);
    const [newDate, setNewDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [maxChoice, setMaxChoice] = useState(5);

    useEffect(() => {
        const fetchDeadline = async () => {
            try {
                const response = await api.get('/deadlines/');
                const items = response.data.find((d) => d.type === "voeux" && d.level === level);
    
                if (items) {
                    setDeadline(items);
                    setLevel(items.level);
                    setNewDate(items.limite_date.slice(0, 16));
                    setMaxChoice(items.max_choice);
                }else {
                // Pas encore configuré pour ce niveau
                setDeadline(null);
                setNewDate("");
                setMaxChoice(5);
            }
            } catch (err) {
                console.error("Erreur lors du chargement:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDeadline();
    }, [level]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const payload = {
                type: "voeux",
                limite_date: newDate,
                max_choice: maxChoice,
                level: level,
            };

            const url = deadline
                ? `/deadlines/${deadline.id}/`
                : '/deadlines/';

            const method = deadline ? 'put' : 'post';

            await api[method](url, payload);
            setMessage("Paramètres enregistrés ✅");

            setTimeout(() => onClose(), 1500);
        } catch (err) {
            setMessage(`Erreur: ${err.response?.data?.message || "Échec de l'enregistrement"}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center border-b p-4">
                    <h2 className="text-xl font-semibold flex items-center">
                        <FiCalendar className="mr-2 text-blue-500" />
                        Paramètres des Vœux
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                        aria-label="Fermer"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                <div className="p-6 dark:bg-gray-900 bg-gray-50">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <FiLoader className="animate-spin h-6 w-6 text-blue-500 mr-2" />
                            <span>Chargement...</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                    Niveau
                                </label>
                                <select
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                >
                                    <option value="L2">L2</option>
                                    <option value="L3">L3</option>
                                    <option value="M1">M1</option>
                                    <option value="M2">M2</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                    Date limite
                                </label>
                                <input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                    Nombre maximum de vœux
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={maxChoice}
                                    onChange={(e) => setMaxChoice(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:text-black transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                                >
                                    {deadline ? "Mettre à jour" : "Enregistrer"}
                                </button>
                            </div>

                            {message && (
                                <div className={`mt-3 p-2 rounded text-center ${message.includes("✅")
                                    ? "bg-green-50 text-green-600"
                                    : "bg-red-50 text-red-600"
                                    }`}>
                                    {message}
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeadlineModal;