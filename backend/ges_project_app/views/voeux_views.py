from rest_framework import viewsets, permissions
from rest_framework.response import Response
from ges_project_app.models import Voeux, Project, Student, Deadline
from ges_project_app.serializers.voeux_serializer import VoeuxSerializer
from rest_framework import serializers
from rest_framework.decorators import action
from collections import defaultdict
from django.utils import timezone

class VoeuxViewSet(viewsets.ModelViewSet):
    queryset = Voeux.objects.all()
    serializer_class = VoeuxSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Un étudiant ne peut voir que ses propres voeux
        user = self.request.user
        
        if user.is_authenticated and user.role == 'student':
            return Voeux.objects.filter(student=user.student)
        
        elif user.is_authenticated and user.role == 'admin':
            # Charger tous les vœux
            voeux = Voeux.objects.select_related('student', 'project').order_by('student', 'rank')

            # Charger tous les étudiants
            all_students = Student.objects.all()

            # Charger tous les projets
            all_projects = Project.objects.all()

            # Initialisation de la structure des données
            students_dict = defaultdict(lambda: {"student": {}, "choices": []})
            used_projects = set()  # Pour suivre les projets choisis
            students_with_choices = []
            students_without_choices = []

            # Remplir la structure avec les vœux existants
            for voeu in voeux:
                student_id = voeu.student.id

                if not students_dict[student_id]["student"]:
                    students_dict[student_id]["student"] = {
                        "id": voeu.student.id,
                        "name": voeu.student.user.username,
                        "full_name": voeu.student.user.get_full_name(),
                        "level": voeu.student.level
                    }

                students_dict[student_id]["choices"].append({
                    "project": {
                        "id": voeu.project.id,
                        "code": voeu.project.code,
                        "title": voeu.project.title
                    },
                    "rank": voeu.rank,
                    "note_preference": voeu.note_preference
                })

                # Ajouter le projet dans la liste des projets utilisés
                used_projects.add(voeu.project.id)

            # Séparer les étudiants avec et sans vœux
            for student in all_students:
                student_data = {
                    "id": student.id,
                    "name": student.user.username,
                    "full_name": student.user.get_full_name(),
                    "level": voeu.student.level,
                    "choices": students_dict[student.id]["choices"]
                }
                if student.id in students_dict and students_dict[student.id]["choices"]:
                    students_with_choices.append(student_data)
                else:
                    students_without_choices.append(student_data)

            # Identifier les projets non choisis
            unused_projects = [
                {"id": project.id, "title": project.title}
                for project in all_projects if project.id not in used_projects
            ]

            return {
                "students_with_choices": students_with_choices,
                "students_without_choices": students_without_choices,
                "unchoose_projects": unused_projects
            }

        return Voeux.objects.none()
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Si on retourne déjà des données structurées (cas admin), pas besoin de sérialisation
        if isinstance(queryset, dict):
            return Response(queryset)
        
        # Si c'est un étudiant, DRF s'occupe de la sérialisation classique
        return super().list(request, *args, **kwargs)
    
    def check_deadline_passed(self):
        try:
            deadline = Deadline.objects.get(type="voeux")
            if timezone.now().date() > deadline.limite_date:
                return True
        except Deadline.DoesNotExist:
            pass
        return False

    @action(detail=False, methods=['post'])
    def submit_voeux(self, request):
        """Soumettre une liste de préférences pour un étudiant."""
        # Vérifier si la date limite est dépassée
        if self.check_deadline_passed():
            return Response({"error": "La date limite pour soumettre les vœux est dépassée."}, status=400)
        
        student = request.user.student
        preferences = request.data.get('voeux', [])  # Format : [{"project_id": 1, "preference_order": 1, "preference_score": 5}]

        # Supprimer les préférences existantes de l'étudiant
        Voeux.objects.filter(student=student).delete()
        # Créer les nouvelles préférences
        for pref in preferences:
            project_id = pref.get('project_id')
            rank = pref.get('rank')
            note_preference = pref.get('note_preference', None)

            project = Project.objects.get(id=project_id)
            Voeux.objects.create(
                student=student,
                project=project,
                rank=rank,
                note_preference=note_preference,
            )

        return Response({"message": "Préférences soumises avec succès."})