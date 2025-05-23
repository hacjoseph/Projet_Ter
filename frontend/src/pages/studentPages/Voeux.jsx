import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const VoeuxPage = () => {
    const [projects, setProjects] = useState([]);
    const [voeux, setVoeux] = useState([]);
    const [error, setError] = useState(null);
    const [preferences_note, setPreferences] = useState({});
    const navigate = useNavigate();

    const [deadline, setDeadline] = useState(null);
    const [deadlinePassed, setDeadlinePassed] = useState(false);

    const filterAvailableProjects = (allProjects, voeux) => {
        return allProjects.filter(
            project => !voeux.some(voeu => voeu.project.id === project.id)
        );
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const projectsResponse = await api.get('/projects/');
                const allProjects = projectsResponse.data;

                const voeuxResponse = await api.get('/voeux/');
                const existingVoeux = voeuxResponse.data;

                setVoeux(existingVoeux);

                const deadlineResponse = await api.get('/deadlines/');
                const voeuxDeadline = deadlineResponse.data.find(d => d.type === "voeux");
                if (voeuxDeadline) {
                    setDeadline(voeuxDeadline);
                    const currentDate = new Date();
                    const deadlineDate = new Date(voeuxDeadline.limite_date + "T23:59:59");
                    setDeadlinePassed(currentDate > deadlineDate);
                }

                const availableProjects = filterAvailableProjects(allProjects, existingVoeux);
                setProjects(availableProjects);

                const initialPreferences = {};
                existingVoeux.forEach(voeu => {
                    initialPreferences[voeu.project_id] = voeu.note_preference;
                });
                setPreferences(initialPreferences);
            } catch (error) {
                console.error('Échec du chargement des données', error);
                setError('Échec du chargement des données');
            }
        };
        fetchData();
    }, []);

    const handlePreferenceChange = (voeuId, value) => {
        setPreferences({
            ...preferences_note,
            [voeuId]: value,
        });
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination } = result;

        const newProjects = [...projects];
        const newVoeux = [...voeux];

        if (source.droppableId === "projects" && destination.droppableId === "voeux") {
            const movedProject = newProjects[source.index];
            newProjects.splice(source.index, 1);
            const newVoeu = {
                id: `voeu-${movedProject.id}`,
                project: movedProject,
                rank: newVoeux.length + 1,
                note_preference: 1,
            };
            newVoeux.splice(destination.index, 0, newVoeu);

            setProjects(newProjects);
            setVoeux(newVoeux);
        }
        else if (source.droppableId === "voeux" && destination.droppableId === "projects") {
            const [movedProject] = newVoeux.splice(source.index, 1);
            newProjects.splice(destination.index, 0, movedProject.project);

            setProjects(newProjects);
            setVoeux(newVoeux);
        }
        else if (source.droppableId === "voeux" && destination.droppableId === "voeux") {
            const [reorderedVoeu] = newVoeux.splice(source.index, 1);
            newVoeux.splice(destination.index, 0, reorderedVoeu);

            setVoeux(newVoeux);
        }
    };

    const submitVoeux = async () => {
        // Vérifier si tous les projets ont été sélectionnés
        if (voeux.length < 5) {
            setError("Vous devez sélectionner tous les projets disponibles avant de soumettre vos vœux.");
            return;
        }

        const voeuxData = voeux.map((voeu, index) => ({
            project_id: voeu.project.id,
            rank: index + 1,
            note_preference: preferences_note[voeu.project.id] || voeu.note_preference || 1,
        }));

        // Vérification: chaque note de préférence ne doit pas être supérieure à la précédente
        for (let i = 1; i < voeuxData.length; i++) {
            if (voeuxData[i].note_preference > voeuxData[i - 1].note_preference) {
                setError(`La note de préférence du projet de rang ${i + 1} ne peut pas être supérieure à celle du projet précédent.`);
                return;
            }
        }

        try {
            await api.post('/voeux/submit_voeux/', { voeux: voeuxData });
            alert('Vos vœux ont été soumis avec succès !');
            navigate('/dashboard');
        } catch (error) {
            setError("Échec de soumission de vos vœux. Veuillez réessayer.");
            console.error('Échec de soumission de vos vœux', error);
        }
    };

    return (
        <div className={"min-h-screen transition-colors dark:bg-gray-900 bg-gray-50"}>
            <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-1 py-8">
                {/* <StudentNavBar /> */}
                <h1>Expression des Vœux</h1>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                {deadline && (
                    <div className={`text-sm font-semibold mt-5 ${deadlinePassed ? 'text-red-500' : 'text-green-500'}`}>
                        Date limite de soumission des vœux: {deadline.limite_date}
                    </div>
                )}
                {deadlinePassed ? (
                    <p className="text-red-600 font-semibold mt-4 mb-4">
                        La date limite pour soumettre vos vœux  est dépassée.
                        Vous ne pouvez plus les modifier ni les soumettre.
                    </p>
                ) : (
                    <div className="mt-4 mb-4">
                        <p className="text-green-600 font-semibold mt-4 mb-4">
                            Vous pouvez soumettre vos vœux jusqu'à la date limite indiquée ci-dessus. <br />
                        </p>

                        <p>
                            Veuillez sélectionner vos projets préférés et les classer par ordre de préférence.
                            <br />
                            Vous devez sélectionner {deadline.max_choice} projets au maximum.
                            <br />
                            Vous pouvez également d'ajouter une note de préférence chaque projet que vous ajoutez.
                            <br />
                            Assurez-vous de soumettre vos vœux avant la date limite.
                            <br />
                        </p>
                    </div>
                )}


                <div className="flex space-x-10">
                    <DragDropContext onDragEnd={handleDragEnd}>
                        {/* Liste des projets disponibles */}
                        {projects.length > 0 && (
                            <Droppable droppableId="projects">
                                {(provided) => (
                                    <div className="border p-4 w-1/2">
                                        <h2 className="text-lg font-semibold">Projets disponibles ({projects.length} restants)</h2>
                                        <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                            {projects.map((project, index) => (
                                                <Draggable key={project.id} draggableId={project.id.toString()} index={index}>
                                                    {(provided) => (
                                                        <li
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="p-2 border rounded-lg shadow-md flex justify-between"
                                                        >
                                                            <span>{project.title}</span>
                                                            <span className="text-sm text-gray-500">{project.supervisor.username}</span>
                                                        </li>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </ul>
                                    </div>
                                )}
                            </Droppable>
                        )}
                        {/* Liste des vœux sélectionnés */}
                        <div className={`border p-4 ${projects.length > 0 ? 'w-1/2' : 'w-full'}`}>
                            <Droppable droppableId="voeux">
                                {(provided) => (
                                    <>
                                        <h2 className="text-lg font-semibold">Mes Vœux ({voeux.length} sélectionnés)</h2>
                                        <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                            {voeux.map((voeu, index) => (
                                                <Draggable key={voeu.id} draggableId={voeu.id.toString()} index={index}>
                                                    {(provided) => (
                                                        <li
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="p-2 border rounded-lg shadow-md flex justify-between"
                                                        >
                                                            <span>{index + 1}. {voeu.project.title}</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="20"
                                                                placeholder={preferences_note[voeu.id] || voeu.note_preference || 1}
                                                                onChange={(e) => handlePreferenceChange(voeu.project.id, e.target.value)}
                                                                className="border rounded p-1 text-sm w-16"
                                                            />
                                                        </li>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </ul>
                                    </>
                                )}
                            </Droppable>
                        </div>
                    </DragDropContext>
                </div>

                {deadlinePassed ? (
                    <p className="text-red-600 font-semibold mt-4"></p>
                ) : (
                    <>
                        <button
                            onClick={submitVoeux}
                            className="mt-4 p-2 bg-blue-500 text-white rounded"
                            disabled={voeux.length < deadline.max_choice || deadlinePassed || voeux.length > deadline.max_choice}
                        >
                            Soumettre mes vœux
                        </button>

                        {voeux.length < deadline.max_choice && (
                            <p className="text-red-500 mt-2">
                                Vous devez sélectionner obligatoirement {deadline.max_choice} projets ({deadline.max_choice - voeux.length} restants) avant de pouvoir soumettre.
                            </p>
                        )}
                        {voeux.length > deadline.max_choice && (
                            <p className="text-red-500 mt-2">
                                Vous Avez dépassé le nombre de voeux possibles. Veuillez retirer  ({voeux.length - deadline.max_choice}) voeux.
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default VoeuxPage;