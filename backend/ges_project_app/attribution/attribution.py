import random
from collections import defaultdict
from django.db import transaction
from ges_project_app.models import ProjectAssignment, Student, Project, Voeux, Team, Deadline


def calculer_score(rank, note_preference, max_choice = 5, alpha=0.6, beta=0.4):
    if not (0 <= note_preference <= 20):
        raise ValueError("La note doit être entre 0 et 20.")
    if not (1 <= rank <= max_choice):
        raise ValueError(f"Le rang doit être entre 1 et {max_choice}.")
    return alpha * (max_choice + 1 - rank) + beta * note_preference

def affecter_projets(level, force_assign=False):
    with transaction.atomic():
        ProjectAssignment.objects.filter(project__level=level).delete()
        
        try:
            param = Deadline.objects.get(level=level)
            max_choice = param.max_choice
        except Deadline.DoesNotExist:
            max_choice = 5

        scores = defaultdict(list)
        preferences = Voeux.objects.filter(project__level=level, student__level=level)
        etudiants_ayant_fait_un_voeu = set()

        for pref in preferences:
            score = calculer_score(pref.rank, pref.note_preference, max_choice=max_choice)
            scores[pref.project].append((score, pref.student))
            etudiants_ayant_fait_un_voeu.add(pref.student)

        for projet in scores:
            scores[projet].sort(key=lambda x: x[0], reverse=True)

        equipes_disponibles = {
            equipe: equipe.max_students for equipe in Team.objects.filter(project__level=level)
        }

        affectations = {}

        for projet in Project.objects.filter(priority=True, level=level):
            if projet not in scores or not scores[projet]:
                continue

            equipes_projet = [e for e in equipes_disponibles if e.project == projet]
            if equipes_projet:
                _, etudiant = scores[projet].pop(0)
                equipe_choisie = equipes_projet[0]
                affectations[etudiant] = equipe_choisie
                equipes_disponibles[equipe_choisie] -= 1

        for projet, etudiants_scores in scores.items():
            equipes_projet = [e for e in equipes_disponibles if e.project == projet]
            if not equipes_projet:
                continue

            while etudiants_scores:
                equipe_courante = next((e for e in equipes_projet if equipes_disponibles[e] > 0), None)
                if not equipe_courante:
                    break

                meilleurs_scores = etudiants_scores[:equipes_disponibles[equipe_courante]]
                dernier_score = meilleurs_scores[-1][0] if meilleurs_scores else None
                candidats = [et for sc, et in meilleurs_scores if sc == dernier_score]

                etudiant_choisi = random.choice(candidats) if len(candidats) > 1 else candidats[0]

                if etudiant_choisi in etudiants_ayant_fait_un_voeu:
                    affectations[etudiant_choisi] = equipe_courante
                    equipes_disponibles[equipe_courante] -= 1

                etudiants_scores = [(s, e) for s, e in etudiants_scores if e != etudiant_choisi]

        etudiants_non_affectes = set(Student.objects.filter(level=level)) - set(affectations.keys())
        etudiants_non_affectes = etudiants_non_affectes.intersection(etudiants_ayant_fait_un_voeu)

        for etudiant in etudiants_non_affectes:
            if force_assign:
                equipe_disponible = next((e for e, cap in equipes_disponibles.items() if cap > 0), None)
                if equipe_disponible and equipe_disponible.project.level == etudiant.level:
                    affectations[etudiant] = equipe_disponible
                    equipes_disponibles[equipe_disponible] -= 1
            else:
                voeux_etudiant = Voeux.objects.filter(student=etudiant, project__level=level).order_by('rank')
                for voeu in voeux_etudiant:
                    equipe_dispo = next(
                        (e for e, cap in equipes_disponibles.items() if e.project == voeu.project and cap > 0),
                        None
                    )
                    if equipe_dispo:
                        affectations[etudiant] = equipe_dispo
                        equipes_disponibles[equipe_dispo] -= 1
                        break

        for etudiant, equipe in affectations.items():
            ProjectAssignment.objects.create(student=etudiant, project=equipe.project, status='pending')

        return {
            "message": f"Affectation terminée pour le niveau {level} avec {len(affectations)} étudiants attribués.",
            "assignments_count": len(affectations),
            "unassigned_count": len(etudiants_non_affectes - set(affectations.keys()))
        }


def calculer_satisfaction(level):
    affectations = ProjectAssignment.objects.filter(project__level=level)
    try:
        param = Deadline.objects.get(level=level)
        max_choice = param.max_choice
    except Deadline.DoesNotExist:
        max_choice = 5
            
    if not affectations.exists():
        return 0

    voeux = Voeux.objects.filter(student__level=level, project__level=level)
    pref_dict = {(v.student_id, v.project_id): v for v in voeux}

    total_score = 0
    max_possible_score = 0

    for affectation in affectations:
        etudiant = affectation.student
        projet = affectation.project
        if (etudiant.id, projet.id) in pref_dict:
            pref = pref_dict[(etudiant.id, projet.id)]
            score = calculer_score(pref.rank, pref.note_preference, max_choice=max_choice)
        else:
            score = 0

        total_score += score
        max_possible_score += calculer_score(1, 20)

    return (total_score / max_possible_score) * 100 if max_possible_score > 0 else 0