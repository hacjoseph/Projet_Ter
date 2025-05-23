from django.db.models import Count, F
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from collections import defaultdict
import itertools
from ges_project_app.models import StudentsTeams, ProjectAssignment, Student, Team

class AssignStudentsToTeamsView(APIView):
    """
    API permettant d'affecter automatiquement les étudiants validés à une équipe
    dans leur projet respectif en respectant les contraintes et en équilibrant
    le nombre d'étudiants par équipe.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # Seuls les admins et superviseurs peuvent exécuter cette action
        if user.role not in ["admin"]:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        reset = request.data.get("reset", False)  # Option pour tout réinitialiser

        if reset:
            StudentsTeams.objects.all().delete() 

        # Récupérer toutes les affectations validées
        assignments = ProjectAssignment.objects.filter(status="pending")

        if not assignments.exists():
            return Response({"message": "No students to assign."}, status=status.HTTP_200_OK)

        assigned_students = []
        errors = []

        # Organiser les étudiants par projet
        students_by_project = defaultdict(list)
        for assignment in assignments:
            students_by_project[assignment.project.id].append(assignment.student)

        # Traiter chaque projet séparément
        for project_id, students in students_by_project.items():
            project_teams = Team.objects.filter(project_id=project_id).annotate(
                current_size=Count("members")
            ).order_by("current_size")

            # Vérifier s'il y a des équipes disponibles
            if not project_teams.exists():
                errors.append(f"No teams found for project {project_id}.")
                continue

            # Trier les étudiants et répartir de manière équilibrée dans les équipes
            teams_cycle = itertools.cycle(project_teams)  # Tourner sur les équipes disponibles

            for student in students:
                # Vérifier si l'étudiant est déjà affecté à une équipe pour ce projet
                if StudentsTeams.objects.filter(student=student, team__project_id=project_id).exists():
                    errors.append(f"Student {student.user.username} is already assigned to a team.")
                    continue

                for _ in range(len(project_teams)):  # Éviter boucle infinie
                    team = next(teams_cycle)

                    # Vérifier que l'équipe n'a pas atteint sa capacité maximale
                    if team.current_size < team.max_students:
                        StudentsTeams.objects.create(student=student, team=team)
                        assigned_students.append(f"Student {student.user.username} assigned to {team.name}.")
                        team.current_size += 1  # Mettre à jour la taille de l'équipe
                        break
                else:
                    errors.append(f"No available team for student {student.user.username} in project {project_id}.")

        return Response({
            "assigned_students": assigned_students,
            "errors": errors
        }, status=status.HTTP_200_OK)