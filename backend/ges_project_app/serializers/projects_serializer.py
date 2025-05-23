from rest_framework import serializers
from ges_project_app.models import Project, Team
from ges_project_app.serializers.user_serialier import UserSerializer

class ProjectSerializer(serializers.ModelSerializer):
    supervisor = UserSerializer(read_only=True)
    class Meta:
        model = Project
        fields = ['id','code', 'title', 'description', 'number_groups', 'supervisor', 'level', 'priority']
        
class TeamSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'min_students', 'max_students', 'project']