
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from ges_project_app.models import User, Student
from ges_project_app.serializers.user_serialier import UserSerializer
from django.contrib.auth.hashers import make_password
from ges_project_app.views.permissions import IsAdminUser
import logging

logger = logging.getLogger(__name__) 

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Récupérer les informations de l'utilisateur connecté."""
        user = request.user
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'full_name': user.get_full_name(),
        }

        # Si l'utilisateur est un étudiant, ajouter les informations supplémentaires
        if hasattr(user, 'student'):
            user_data['level'] = user.student.level

        return Response(user_data)
    
    def get_queryset(self):
        """Filtrer les utilisateurs en fonction de leur rôle si le paramètre role est fourni."""
        role = self.request.query_params.get('role', None)
        if role:
            return self.queryset.filter(role=role)
        return self.queryset
    
    def list(self, request, *args, **kwargs):
        # Réécriture de list pour inclure les données d'étudiant si elles existent
        queryset = self.get_queryset()
        data = []
        for user in queryset:
            serialized = UserSerializer(user).data
            if hasattr(user, 'student'):
                serialized['level'] = user.student.level
            data.append(serialized)
        return Response(data)
    