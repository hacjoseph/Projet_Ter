from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from .permissions import IsAdmin
from ges_project_app.models import ChangeRequest, StudentsTeams, ProjectAssignment
from ges_project_app.serializers.change_request_serializer import ChangeRequestSerializer
from django.utils.timezone import now
from collections import defaultdict


class ChangeRequestViewSet(viewsets.ModelViewSet):
    queryset = ChangeRequest.objects.all()
    serializer_class = ChangeRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "student":
            return ChangeRequest.objects.filter(student__user=user)
        elif user.role == "admin":
            return ChangeRequest.objects.all()
        return ChangeRequest.objects.none()

    def perform_create(self, serializer):
        # L’étudiant crée une demande
        student = self.request.user.student
        current_assignment = student.assignments.first()
        current_team = student.teams.first().team if student.teams.exists() else None
        
        desired_project = serializer.validated_data.get("desired_project")
        desired_team = serializer.validated_data.get("desired_team")
        
        # Vérification : empêcher une demande vers le même projet/équipe
        if desired_project and current_assignment and desired_project == current_assignment.project:
            raise ValidationError("Vous êtes déjà affecté à ce projet.")

        if desired_team and current_team and desired_team == current_team:
            raise ValidationError("Vous êtes déjà membre de cette équipe.")

        serializer.save(
            student=student,
            current_project=current_assignment.project if current_assignment else None,
            current_team=current_team
        )
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user

        if user.role != "admin":
            return Response({"error": "Seuls les administrateurs peuvent traiter les demandes."}, status=403)

        if instance.status != "pending":
            return Response({"error": "La demande a déjà été traitée."}, status=400)

        new_status = request.data.get("status")
        if new_status not in ["approved", "rejected"]:
            return Response({"error": "Statut invalide."}, status=400)

        instance.status = new_status
        instance.processed_by = user
        instance.processed_at = now()

        # S’il est approuvé, appliquer le changement
        if new_status == "approved":
            if instance.desired_team:
                StudentsTeams.objects.update_or_create(
                    student=instance.student,
                    defaults={"team": instance.desired_team}
                )
            elif instance.desired_project:
                ProjectAssignment.objects.update_or_create(
                    student=instance.student,
                    defaults={"project": instance.desired_project}
                )

        instance.save()
        return Response({"message": "Demande traitée avec succès."})
    
    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def detect_cycles(self, request):
        change_requests = ChangeRequest.objects.filter(status="pending")

        graph = defaultdict(list)
        team_to_student = {}
        for req in change_requests:
            if req.current_team is not None and req.desired_team is not None:
                graph[req.current_team.id].append(req.desired_team.id)
                team_to_student[req.current_team.id] = {
                    "student": req.student.user.username,
                    "current_team": req.current_team.name,
                    "desired_team": req.desired_team.name,
                    "request_id": req.id,
                }
                
            elif req.current_project is not None   and req.desired_project is not None :
                graph[req.current_project.id].append(req.desired_project.id)
                team_to_student[req.current_project.id] = {
                    "student": req.student.user.username,
                    "current_project": req.current_project.title,
                    "desired_project": req.desired_project.title,
                    "request_id": req.id,
                }

        visited = set()
        stack = []

        def dfs(node, start):
            if node in stack:
                cycle = stack[stack.index(node):] + [node]
                return cycle
            if node in visited:
                return None
            visited.add(node)
            stack.append(node)
            for neighbor in graph.get(node, []):
                cycle = dfs(neighbor, start)
                if cycle:
                    return cycle
            stack.pop()
            return None

        for team_id in graph:
            visited.clear()
            stack.clear()
            cycle = dfs(team_id, team_id)
            if cycle:
                cycle_details = [team_to_student[tid] for tid in cycle if tid in team_to_student]
            return Response({"cycle_detected": True, "cycle": cycle_details})

        return Response({"cycle_detected": False})
    
    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def approve_cycle(self, request):
        request_ids = request.data.get("request_ids", [])

        if not isinstance(request_ids, list) or not request_ids:
            return Response({"error": "Liste de demandes invalide."}, status=400)

        for req_id in request_ids:
            try:
                req = ChangeRequest.objects.get(id=req_id, status="pending")
                req.status = "approved"
                req.processed_by = request.user
                req.processed_at = now()
                if req.desired_team:
                    StudentsTeams.objects.update_or_create(student=req.student, defaults={"team": req.desired_team})
                req.save()
            except ChangeRequest.DoesNotExist:
                continue

        return Response({"message": "Échange du cycle approuvé avec succès."})