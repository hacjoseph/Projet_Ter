import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { FiEdit2, FiTrash2, FiUser, FiMail, FiLock, FiUserPlus, FiSave, FiBook, FiX } from "react-icons/fi";
import { FaUserShield, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        id: null,
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        role: "student",
        level: "M1",
        password: ""
    });
    const [editing, setEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/users/");
            setUsers(res.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = { ...form };
            // Ne pas envoyer le niveau si l'utilisateur n'est pas étudiant
            if (payload.role !== "student") {
                delete payload.level;
            }

            if (editing && !payload.password) {
                delete payload.password;
            }
            if (!editing && (!payload.password || payload.password.length < 8)) {
                setError("Le mot de passe doit contenir au moins 8 caractères");
                setIsLoading(false);
                return;
            }

            if (editing) {
                await api.put(`/users/${form.id}/`, payload);
            } else {
                await api.post("/users/", payload);
            }
            fetchUsers();
            resetForm();
        } catch (error) {
            setError("Erreur Utilisateur non crée")
            console.error("Erreur Utilisateur non crée:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setForm({ id: null, username: "", email: "", first_name: "", last_name: "", role: "student", password: "" });
        setEditing(false);
    };

    const handleEdit = (user) => {
        setForm({ ...user, level: user.level || "M1", password: "" });
        setEditing(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Confirmer la suppression de cet utilisateur ?")) {
            setIsLoading(true);
            try {
                await api.delete(`/users/${id}/`);
                fetchUsers();
            } catch (error) {
                setError("Erreur Utilisateur no supprimé")
                console.error("Erreur Utilisateur no supprimé:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case "admin":
                return <FaUserShield className="text-purple-500 dark:text-purple-400" />;
            case "student":
                return <FaUserGraduate className="text-blue-500 dark:text-blue-400" />;
            case "supervisor":
                return <FaChalkboardTeacher className="text-green-500 dark:text-green-400" />;
            default:
                return <FiUser className="text-gray-500 dark:text-gray-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-200">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestion des Utilisateurs</h1>
                    {editing && (
                        <button
                            onClick={resetForm}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <FiX size={16} /> Annuler
                        </button>
                    )}
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
                {/* User Form */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 transition-colors duration-200">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                        {editing ? (
                            <>
                                <FiEdit2 className="text-blue-500 dark:text-blue-400" /> Modifier un Utilisateur
                            </>
                        ) : (
                            <>
                                <FiUserPlus className="text-green-500 dark:text-green-400" /> Ajouter un Nouvel Utilisateur
                            </>
                        )}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom d'utilisateur</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiUser className="text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        name="username"
                                        value={form.username}
                                        onChange={handleChange}
                                        placeholder="john_doe"
                                        required
                                        className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMail className="text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        required
                                        className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prénom</label>
                                <input
                                    name="first_name"
                                    value={form.first_name}
                                    onChange={handleChange}
                                    placeholder="John"
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
                                <input
                                    name="last_name"
                                    value={form.last_name}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                >
                                    <option value="student">Étudiant</option>
                                    <option value="supervisor">Superviseur</option>
                                    <option value="admin">Administrateur</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Mot de passe {editing && "(laisser vide pour ne pas changer)"}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required={!editing}
                                        className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                    />
                                </div>
                            </div>


                            {/* Nouveau champ Niveau (visible seulement pour les étudiants) */}
                            {form.role === "student" && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Niveau</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiBook className="text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <select
                                            name="level"
                                            value={form.level}
                                            onChange={handleChange}
                                            className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                        >
                                            <option value="L2">Licence 2</option>
                                            <option value="L3">Licence 3</option>
                                            <option value="M1">Master 1</option>
                                            <option value="M2">Master 2</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium ${editing
                                    ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                    : "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                                    } transition-colors ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>
                                        {editing ? <FiSave size={18} /> : <FiUserPlus size={18} />}
                                        {editing ? "Mettre à jour" : "Créer"} l'utilisateur
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Users List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors duration-200">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Liste des Utilisateurs</h2>
                    </div>

                    {isLoading && users.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">Chargement en cours...</div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">Aucun utilisateur trouvé</div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((user) => (
                                <div key={user.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                                                    {getRoleIcon(user.role)}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {user.full_name  ? user.full_name : user.username}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    {user.email} • {user.role === "student" ? "Étudiant" : user.role === "supervisor" ? "Superviseur" : "Administrateur"}
                                                    {user.role === "student" && user.level && (
                                                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            {user.level}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                <FiEdit2 size={14} /> Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-700 rounded-lg hover:bg-red-100 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                <FiTrash2 size={14} /> Supprimer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
};

export default AdminUserManagement;