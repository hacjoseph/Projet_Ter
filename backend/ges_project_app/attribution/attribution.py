import random
from collections import defaultdict
from django.db import transaction
from ges_project_app.models import ProjectAssignment, Student, Project, Voeux, Team


def calculer_score(rank, note_preference, max_choice = 5, alpha=0.6, beta=0.4):
    if not (0 <= note_preference <= 20):
        raise ValueError("La note doit être entre 0 et 20.")
    if not (1 <= rank <= max_choice):
        raise ValueError(f"Le rang doit être entre 1 et {max_choice}.")
    return alpha * (max_choice + 1 - rank) + beta * note_preference

def affecter_projets(level):
    with transaction.atomic():
        ProjectAssignment.objects.filter(project__level=level).delete()

        # Stockage des scores {Projet: [(score, étudiant)]}
        scores = defaultdict(list)

        # Récupération des vœux des étudiants pour le niveau donné
        preferences = Voeux.objects.filter(project__level=level, student__level=level)
        etudiants_ayant_fait_un_voeu = set()
        
        for pref in preferences:
            total_projects = Project.objects.filter(level=level).count()
            score = calculer_score(pref.rank, pref.note_preference)
            scores[pref.project].append((score, pref.student))
            etudiants_ayant_fait_un_voeu.add(pref.student)

        # Trier les étudiants pour chaque projet par score décroissant
        for projet in scores:
            scores[projet].sort(key=lambda x: x[0], reverse=True)

        # Stocker la capacité restante de chaque équipe pour le niveau donné
        equipes_disponibles = {
            equipe: equipe.max_students for equipe in Team.objects.filter(project__level=level)
        }

        affectations = {}  # {Étudiant: Équipe}

        # Affectation aux projets prioritaires
        for projet in Project.objects.filter(priority=True, level=level):
            if projet not in scores or not scores[projet]:
                continue

            equipes_projet = [equipe for equipe in equipes_disponibles if equipe.project == projet]
            if equipes_projet:
                _, etudiant = scores[projet].pop(0)
                equipe_choisie = equipes_projet[0]
                affectations[etudiant] = equipe_choisie
                equipes_disponibles[equipe_choisie] -= 1

        # Affectation générale des étudiants
        for projet, etudiants_scores in scores.items():
            equipes_projet = [equipe for equipe in equipes_disponibles if equipe.project == projet]
            if not equipes_projet:
                continue

            while etudiants_scores:
                equipe_courante = next((e for e in equipes_projet if equipes_disponibles[e] > 0), None)
                if not equipe_courante:
                    break 

                # Sélection des meilleurs étudiants
                meilleurs_scores = etudiants_scores[:equipes_disponibles[equipe_courante]]

                # Vérification des égalités de score
                dernier_score = meilleurs_scores[-1][0] if meilleurs_scores else None
                candidats = [et for sc, et in meilleurs_scores if sc == dernier_score]

                # Sélection aléatoire en cas d'égalité
                etudiant_choisi = random.choice(candidats) if len(candidats) > 1 else candidats[0]

                # Affectation seulement si l'étudiant a fait un vœu
                if etudiant_choisi in etudiants_ayant_fait_un_voeu:
                    affectations[etudiant_choisi] = equipe_courante
                    equipes_disponibles[equipe_courante] -= 1

                # Suppression des étudiants affectés
                etudiants_scores = [(s, e) for s, e in etudiants_scores if e != etudiant_choisi]

        # Affectation des étudiants non placés uniquement si des places restent
        etudiants_non_affectes = set(Student.objects.filter(level=level)) - set(affectations.keys())
        etudiants_non_affectes = etudiants_non_affectes.intersection(etudiants_ayant_fait_un_voeu)

        for etudiant in etudiants_non_affectes:
            equipe_disponible = next((e for e, cap in equipes_disponibles.items() if cap > 0), None)

            if equipe_disponible and equipe_disponible.project.level == etudiant.level:
                affectations[etudiant] = equipe_disponible
                equipes_disponibles[equipe_disponible] -= 1

        # Sauvegarde des affectations en base
        for etudiant, equipe in affectations.items():
            ProjectAssignment.objects.create(student=etudiant, project=equipe.project, status='pending')

        return {
            "message": f"Affectation terminée pour le niveau {level} avec {len(affectations)} étudiants attribués.",
            "assignments_count": len(affectations),
            "unassigned_count": len(etudiants_non_affectes)
        }
    
    
    
def calculer_satisfaction(level):
    affectations = ProjectAssignment.objects.filter(project__level=level)
    
    if not affectations.exists():
        return 0 
    
    voeux = Voeux.objects.filter(student__level=level, project__level=level)
    pref_dict = {(v.student_id, v.project_id): v for v in voeux}
    
    total_score = 0
    max_possible_score = 0
    n_etudiants = affectations.count()

    for affectation in affectations:
        etudiant = affectation.student
        projet = affectation.project
        # Vérifier si l'étudiant a un vœu pour ce projet
        if (etudiant.id, projet.id) in pref_dict:
            pref = pref_dict[(etudiant.id, projet.id)]
            total_projects = Project.objects.filter(level=level).count()
            score = calculer_score(pref.rank, pref.note_preference)
        else:
            score = 0

        total_score += score
        total_projects = Project.objects.filter(level=level).count()
        max_possible_score += calculer_score(1, 20)
        
    score_stisfaction = (total_score / max_possible_score) * 100

    return  score_stisfaction if max_possible_score > 0 else 0