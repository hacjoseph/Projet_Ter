from collections import Counter, defaultdict
from ges_project_app.models import Student, Project, Voeux, ProjectAssignment, Team
from ges_project_app.attribution import attribution, gale_shapley_attribution
from rest_framework.response import Response

def analyser_affectations(level, algorithm):
    all_students = Student.objects.filter(level=level)
    all_projects = Project.objects.filter(level=level)
    all_voeux = Voeux.objects.filter(student__level=level, project__level=level)
    affectations = ProjectAssignment.objects.filter(project__level=level)

    assigned_students = set(a.student for a in affectations)
    unassigned_students = set(all_students) - assigned_students

    # Classer les non affectés
    no_wish = []
    no_available_place = []
    
    voeux_dict = defaultdict(list)
    for v in all_voeux:
        voeux_dict[v.student.id].append(v.project.id)

    equipes_capacite = {
        equipe.project_id: 0 for equipe in Team.objects.filter(project__level=level)
    }
    for equipe in Team.objects.filter(project__level=level):
        equipes_capacite[equipe.project_id] += equipe.max_students

    demande_par_projet = Counter(v.project_id for v in all_voeux)

    for student in unassigned_students:
        student_voeux = voeux_dict.get(student.id, [])
        if not student_voeux:
            no_wish.append(student)
        else:
            # Vérifier si tous les projets choisis sont pleins
            tous_pleins = all(
                demande_par_projet[p] > equipes_capacite.get(p, 0)
                for p in student_voeux
            )
            if tous_pleins:
                no_available_place.append(student)
                
    # Calcul du score de satisfaction selon l'algo choisi
            if algorithm == "algo1":
                satisfaction_score = gale_shapley_attribution.calculer_satisfaction(level=level)
            elif algorithm == "algo2":
                satisfaction_score = attribution.calculer_satisfaction(level=level)
            else:
                return Response(
                    {"error": f"Algorithme inconnu : {algorithm}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

    # 2. Suggestions
    projets_satures = [
        {
            "project_id": pid,
            "project_title": Project.objects.get(id=pid).title,
            "demandes": demande_par_projet[pid],
            "capacite": equipes_capacite[pid]
        }
        for pid in demande_par_projet
        if demande_par_projet[pid] > equipes_capacite.get(pid, 0)
    ]

    projets_non_demandes = [
        {
            "project_id": project.id,
            "project_title": project.title,
            "supervisor": project.supervisor.username
        }
        for project in all_projects
        if demande_par_projet.get(project.id, 0) == 0
    ]

    return {
        "non_affectes": {
            "aucun_voeu": [{"id": s.id, "nom": s.user.username, "full_name": s.user.get_full_name()} for s in no_wish],
            "projets_satures": [{"id": s.id, "nom": s.user.username, "full_name": s.user.get_full_name()} for s in no_available_place],
            "autres": len(unassigned_students) - len(no_wish) - len(no_available_place)
        },
        "suggestions": {
            "dupliquer_projets": projets_satures,
            "revoir_projets": projets_non_demandes
        },
        "stats": {
            "total_students": all_students.count(),
            "assigned": len(assigned_students),
            "unassigned": len(unassigned_students),
            "satisfaction_score": round(satisfaction_score, 2)
        }
    }