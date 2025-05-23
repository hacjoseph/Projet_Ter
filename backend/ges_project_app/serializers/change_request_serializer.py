from rest_framework import serializers
from ges_project_app.models import ChangeRequest

class ChangeRequestSerializer(serializers.ModelSerializer):
    
    student_full_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_username = serializers.EmailField(source='student.user.username', read_only=True)
    current_project_title = serializers.SerializerMethodField()
    current_team_name = serializers.SerializerMethodField()
    desired_project_title = serializers.SerializerMethodField()
    desired_team_name = serializers.SerializerMethodField()

    class Meta:
        model = ChangeRequest
        fields = [
            "id",
            "student",
            "student_full_name",
            "student_username",
            "reason",
            "status",
            "created_at",
            "current_project",
            "current_project_title",
            "current_team",
            "current_team_name",
            "desired_project",
            "desired_project_title",
            "desired_team",
            "desired_team_name",
        ]
        read_only_fields = ["student", "status", "created_at", "processed_at", "processed_by"]

    def get_current_project_title(self, obj):
        return obj.current_project.title if obj.current_project else None

    def get_current_team_name(self, obj):
        return obj.current_team.name if obj.current_team else None

    def get_desired_project_title(self, obj):
        return obj.desired_project.title if obj.desired_project else None

    def get_desired_team_name(self, obj):
        return obj.desired_team.name if obj.desired_team else None