from rest_framework import serializers
from ges_project_app.models import Voeux, Student, Project
from django.contrib.auth import get_user_model
from ges_project_app.serializers.students_serializer import StudentSerializer
from ges_project_app.serializers.projects_serializer import ProjectSerializer

User = get_user_model()

class VoeuxSerializer(serializers.ModelSerializer):
    
    student = StudentSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)
    
    class Meta:
        model = Voeux
        fields = ['id', 'student', 'project', 'rank', 'note_preference']
        

    def validate_score(self, data):
        """ Vérifie que la note est entre 1 et 10 """
        if 1 <= data['note_preference'] <= 20:
            raise serializers.ValidationError("La note doit être entre 1 et 20.")
        return data
    
    def validate(self, data):
        """ Vérifie qu'un étudiant ne peut pas attribuer le même rang à plusieurs projets """
        student = self.context['request'].user
        rank = data['rank']
        
        existing_preference = Voeux.objects.filter(student=student, rank=rank).exists()
        if existing_preference:
            raise serializers.ValidationError("Vous avez déjà utilisé ce rang pour un autre projet.")
        
        return data