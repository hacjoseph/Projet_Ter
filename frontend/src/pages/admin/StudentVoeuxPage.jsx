import React, { useState, useEffect } from 'react';
import { FiUser, FiBook, FiAward, FiLoader, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import api from '../../api/axios';
import DeadlineModal from './DeadLineModal';

const StudentVoeuxPage = () => {
    const [data, setData] = useState({
        students_with_choices: [],
        students_without_choices: [],
        unchoose_projects: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('with_choices');
    const [showDeadlineModal, setShowDeadlineModal] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState("");

    // Récupérer les données des voeux
    const fetchWishesData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/voeux/');
            setData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des voeux');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishesData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <FiLoader className="animate-spin h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen flex-col text-red-500 dark:text-red-400">
                <FiAlertCircle className="h-8 w-8 mb-2" />
                <p className="mb-4">{error}</p>
                <button
                    onClick={fetchWishesData}
                    className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen`}>
            <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <Header
                        onOpenModal={() => setShowDeadlineModal(true)}
                    />

                    {showDeadlineModal && (
                        <DeadlineModal onClose={() => setShowDeadlineModal(false)} />
                    )}

                    <MainContent
                        activeTab={activeTab}
                        data={data}
                        onTabChange={setActiveTab}
                    />
                </div>
            </div>
        </div>
    );

};

// Composant d'en-tête
const Header = ({ onOpenModal }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                <FiBook className="mr-2 text-blue-500 dark:text-blue-400" />
                Gestion des Vœux
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Consultation des choix des étudiants
            </p>
        </div>

        <div className="flex items-center gap-3">
            <button
                onClick={onOpenModal}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
                <FiCalendar className="mr-2" />
                Gérer la deadline
            </button>
        </div>
    </div>
);
// Composant principal
const MainContent = ({ activeTab, data, onTabChange }) => (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">

            {/* Contenu principal */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex -mb-px overflow-x-auto">
                        <TabButton
                            active={activeTab === 'with_choices'}
                            onClick={() => onTabChange('with_choices')}
                        >
                            Avec voeux ({data.students_with_choices.length})
                        </TabButton>
                        <TabButton
                            active={activeTab === 'without_choices'}
                            onClick={() => onTabChange('without_choices')}
                        >
                            Sans voeux ({data.students_without_choices.length})
                        </TabButton>
                        <TabButton
                            active={activeTab === 'unchoose_projects'}
                            onClick={() => onTabChange('unchoose_projects')}
                        >
                            Projets non choisis ({data.unchoose_projects.length})
                        </TabButton>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'with_choices' && (
                        <StudentsWithWishes students={data.students_with_choices} />
                    )}

                    {activeTab === 'without_choices' && (
                        <StudentsWithoutWishes students={data.students_without_choices} />
                    )}

                    {activeTab === 'unchoose_projects' && (
                        <UnchosenProjects projects={data.unchoose_projects} />
                    )}
                </div>
            </div>
        </div>
    </div>
);

// Composants enfants
const TabButton = ({ children, active = false, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${active
            ? 'border-b-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
    >
        {children}
    </button>
);

const StudentsWithWishes = ({ students }) => {
    if (students.length === 0) {
        return <EmptyState icon={<FiBook className="h-8 w-8" />} title="Aucun voeu enregistré" />;
    }

    return (
        <div className="space-y-4">
            {students.map(student => (
                <StudentWishesCard key={student.id} student={student} />
            ))}
        </div>
    );
};

const StudentsWithoutWishes = ({ students }) => {
    if (students.length === 0) {
        return <EmptyState icon={<FiAward className="h-8 w-8" />} title="Tous les étudiants ont formulé des voeux" />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map(student => (
                <div key={student.id} className="border dark:border-gray-700 rounded-lg p-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <FiUser className="text-gray-400 dark:text-gray-500 mr-3" />
                    <div>
                        <p className="font-medium dark:text-white">{student.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Niveau: {student.level}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const UnchosenProjects = ({ projects }) => {
    if (projects.length === 0) {
        return <EmptyState icon={<FiAward className="h-8 w-8" />} title="Tous les projets ont été choisis" />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
                <div key={project.id} className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <FiBook className="text-gray-400 dark:text-gray-500 mb-2" />
                    <h3 className="font-medium dark:text-white">{project.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{project.code}</p>
                </div>
            ))}
        </div>
    );
};

const StudentWishesCard = ({ student }) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center">
                <FiUser className="text-gray-500 dark:text-gray-400 mr-2" />
                <span className="font-medium dark:text-white">{student.full_name ? student.full_name : student.name}</span>
                <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                    {student.level}
                </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
                {student.choices.length} vœu{student.choices.length > 1 ? 'x' : ''}
            </span>
        </div>

        <div className="p-4">
            <div className="space-y-3">
                {student.choices
                    .sort((a, b) => a.rank - b.rank)
                    .map(choice => (
                        <div key={`${student.id}-${choice.project.id}`} className="flex items-start">
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center 
                ${choice.rank === 1
                                    ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}>
                                {choice.rank}
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="font-medium dark:text-white">{choice.project.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{choice.project.code}</p>
                                {choice.note_preference && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Note de préférence: {choice.note_preference}/20
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    </div>
);

const EmptyState = ({ icon, title, description }) => (
    <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
            {icon}
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
    </div>
);

export default StudentVoeuxPage;   