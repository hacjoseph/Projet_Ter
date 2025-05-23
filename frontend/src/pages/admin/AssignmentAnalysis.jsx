import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ProjectList() {
    const [data, setData] = useState({
        non_affectes: {
            aucun_voeu: [],
            projets_satures: [],
            autres: 0
        },
        suggestions: {
            dupliquer_projets: [],
            revoir_projets: []
        },
        stats: {
            total_students: 0,
            assigned: 0,
            unassigned: 0,
            satisfaction_score: 0
        }
    });
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState("");
    const [selectedAlgo, setSelectedAlgo] = useState("algo1");

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get("/projects-assign/", {
                params: {
                    level: selectedLevel,
                    algorithm: selectedAlgo,
                },
            });
            console.log(response.data);
            setData(response.data);
            setError(null);
        } catch (err) {
            setError("Erreur lors du chargement des données d'affectation.");
        } finally {
            setLoading(false);
        }
    };

    const assignProjects = async () => {
        if (!selectedLevel) {
            setError("Veuillez sélectionner un niveau avant de lancer l'affectation.");
            return;
        }

        setAssigning(true);
        try {
            await api.post("/projects-assign/", { level: selectedLevel, algorithm: selectedAlgo });
            await fetchData();
        } catch (err) {
            setError("Erreur lors de l'affectation.");
        } finally {
            setAssigning(false);
        }
    };

    useEffect(() => {
        if (selectedLevel) {
            fetchData();
        }
    }, [selectedLevel, selectedAlgo]);

    const getBackgroundColor = (score) => {
        if (score > 70) return "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200";
        if (score >= 50) return "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200";
        return "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200";
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-gray-900 min-h-screen">
            {/* En-tête */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🎯 Gestion des affectations de projets</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Visualisation et gestion des affectations étudiants-projets</p>
                </div>

                {/* Sélection du niveau */}
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                    <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="">Sélectionnez un niveau</option>
                        <option value="L2">Licence 2</option>
                        <option value="L3">Licence 3</option>
                        <option value="M1">Master 1</option>
                    </select>
                    <select
                        value={selectedAlgo}
                        onChange={(e) => setSelectedAlgo(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="algo1">Algo 1</option>
                        <option value="algo2">Algo 2</option>
                    </select>

                    {/* Bouton d'affectation */}
                    <button
                        type="button"
                        onClick={() => {
                            if (window.confirm("Êtes-vous sûr de vouloir lancer l'affectation ?")) {
                                assignProjects();
                            }
                        }}
                        disabled={assigning}
                        className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${assigning
                            ? "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
                            }`}
                    >
                        {assigning ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Traitement en cours...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Lancer l'affectation
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Message d'erreur */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-4 mb-6 rounded">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistiques */}
            {!loading && selectedLevel && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Étudiants</h3>
                        <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{data.stats.assigned}</span>
                            <span className="ml-2 text-gray-500 dark:text-gray-400">/ {data.stats.total_students} affectés</span>
                        </div>
                        <div className="mt-4">
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600"
                                    style={{ width: `${(data.stats.assigned / data.stats.total_students) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Non affectés</h3>
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">{data.stats.unassigned}</div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Étudiants sans projet attribué</p>
                    </div>

                    <div className={`rounded-lg shadow p-6 ${getBackgroundColor(data.stats.satisfaction_score)}`}>
                        <h3 className="text-lg font-medium mb-2">Satisfaction</h3>
                        <div className="text-3xl font-bold">{data.stats.satisfaction_score}%</div>
                        <p className="mt-2 text-sm">Score moyen des affectations</p>
                    </div>
                </div>
            )}

            {/* Contenu principal */}
            {loading ? (
                <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden animate-pulse">
                            <div className="h-16 bg-gray-200 dark:bg-gray-700"></div>
                            <div className="p-6 space-y-4">
                                {[...Array(4)].map((_, j) => (
                                    <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : selectedLevel ? (
                <div className="space-y-8">
                    {/* Étudiants non affectés */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
                            <h3 className="text-lg font-medium text-red-700 dark:text-red-300">
                                Étudiants non affectés ({data.stats.unassigned})
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {/* Aucun voeu */}
                            <div className="p-6">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                                    Aucun voeu formulé ({data.non_affectes.aucun_voeu.length})
                                </h4>
                                {data.non_affectes.aucun_voeu.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {data.non_affectes.aucun_voeu.map((student) => (
                                            <div key={student.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{student.full_name ? student.full_name : student.nom}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tous les étudiants ont formulé au moins un voeu</p>
                                )}
                            </div>

                            {/* Projets saturés */}
                            <div className="p-6">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                                    Projets saturés ({data.non_affectes.projets_satures.length})
                                </h4>
                                {data.non_affectes.projets_satures.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {data.non_affectes.projets_satures.map((student) => (
                                            <div key={student.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{student.full_name ? student.full_name : student.nom}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Aucun étudiant dans cette catégorie</p>
                                )}
                            </div>

                            {/* Autres cas */}
                            {data.non_affectes.autres > 0 && (
                                <div className="p-6">
                                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                                        Autres cas ({data.non_affectes.autres})
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {data.non_affectes.autres} étudiant(s) non affecté(s) pour d'autres raisons
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                            <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300">
                                Suggestions d'amélioration
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {/* Projets à dupliquer */}
                            <div className="p-6">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                                    Projets à dupliquer (saturés) ({data.suggestions.dupliquer_projets.length})
                                </h4>
                                {data.suggestions.dupliquer_projets.length > 0 ? (
                                    <div className="space-y-4">
                                        {data.suggestions.dupliquer_projets.map((project) => (
                                            <div key={project.project_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                <h5 className="font-medium text-gray-900 dark:text-white">{project.project_title}</h5>
                                                <div className="mt-2 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Demandes: {project.demandes}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Capacité: {project.capacite}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Aucun projet saturé</p>
                                )}
                            </div>

                            {/* Projets à revoir */}
                            <div className="p-6">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                                    Projets non demandés ({data.suggestions.revoir_projets.length})
                                </h4>
                                {data.suggestions.revoir_projets.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {data.suggestions.revoir_projets.map((project) => (
                                            <div key={project.project_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                <h5 className="font-medium text-gray-900 dark:text-white">{project.project_title}</h5>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Superviseur: {project.supervisor}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tous les projets ont été demandés</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Sélectionnez un niveau</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Veuillez choisir un niveau pour afficher les données d'affectation</p>
                </div>
            )}
        </div>
    );
}