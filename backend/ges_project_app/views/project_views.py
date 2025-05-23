from rest_framework import viewsets, permissions
from ges_project_app.models import Project, Team, Student
from ges_project_app.serializers.projects_serializer import ProjectSerializer, TeamSerializer
from rest_framework.exceptions import PermissionDenied
from .permissions import IsSupervisorOrAdmin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Prefetch
from rest_framework import status


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsSupervisorOrAdmin]
    def get_queryset(self):
        user = self.request.user
        level = self.request.query_params.get("level")
        print("Level:", level)
        
        if user.is_authenticated:
            if user.role == 'student':
                try:
                    student = Student.objects.get(user=user)  
                    return Project.objects.filter(level=student.level)
                except Student.DoesNotExist:
                    return Project.objects.none() 
            
            elif user.role == 'supervisor':
                if level:
                    return Project.objects.filter(supervisor=user, level=level)
                else:
                    return Project.objects.filter(supervisor=user)
            elif user.role == 'admin':
                if level:
                    return Project.objects.filter(level=level)
                else:
                    return Project.objects.all()
            
        return Project.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(supervisor=self.request.user)
        
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user

        # Vérifier si l'utilisateur peut modifier ce projet
        if user.role == "supervisor" and instance.supervisor != user:
            return Response({"error": "Vous ne pouvez modifier que vos propres projets."}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)
    
    
class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsSupervisorOrAdmin]
    
    

class ProjectWithTeamsView(APIView):
    """
    Retourne les projets avec leurs équipes et étudiants en fonction du rôle de l'utilisateur :
    - Admin → Tous les projets avec leurs équipes et étudiants.
    - Supervisor → Seulement ses projets avec leurs équipes et étudiants.
    - Student → Seulement ses équipes et les étudiants qui y sont inscrits.
    """
    permission_classes = [IsAuthenticated, IsSupervisorOrAdmin]  # Sécurité renforcée

    def get(self, request):
        user = request.user  

        # **1. Si Admin → Voir tous les projets**
        if user.role == "admin":
            projects = Project.objects.prefetch_related(
                Prefetch("teams", queryset=Team.objects.prefetch_related("members__student"))
            ).select_related("supervisor")

        # **2. Si Supervisor → Voir seulement ses projets**
        elif user.role == "supervisor":
            projects = Project.objects.filter(supervisor=user).prefetch_related(
                Prefetch("teams", queryset=Team.objects.prefetch_related("members__student"))
            ).select_related("supervisor")

        # **3. Si Student → Voir seulement ses équipes**
        else:  # Ici, on suppose que `role == "student"`
            student_instance = Student.objects.get(user=user) 
            teams = Team.objects.filter(members__student=student_instance).prefetch_related("members__student")
            data = {
                "teams": [
                    {
                        "id": team.id,
                        "name": team.name,
                        "project_id": team.project.id,
                        "project_name": team.project.code,
                        "project_title": team.project.title,
                        "supervisor": team.project.supervisor.username,
                        "students": [
                            {
                                "id": student.student.id, 
                                "name": student.student.user.username,
                                "full_name": student.student.user.get_full_name()
                            }
                            
                            for student in team.members.all()
                        ],
                    }
                    for team in teams
                ]
            }
            return Response(data)  # Si étudiant, pas besoin d'afficher les projets

        # **Générer la réponse pour Admin et Supervisor**
        data = []
        for project in projects:
            project_data = {
                "project_id": project.id,
                "project_code": project.code,
                "project_title": project.title,
                "project_priority": project.priority,
                "supervisor": project.supervisor.username,
                "teams": []
            }

            for team in project.teams.all():
                team_data = {
                    "id": team.id,
                    "name": team.name,
                    "min_students": team.min_students,
                    "max_students": team.max_students,
                    "project_id": team.project.id,
                    "students": [
                        {"id": student.student.id, "name": student.student.user.username}
                        for student in team.members.all()
                    ],
                }
                project_data["teams"].append(team_data)

            data.append(project_data)

        return Response({"projects": data})