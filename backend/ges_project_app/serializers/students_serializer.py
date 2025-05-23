from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from ges_project_app.models import Student
from ges_project_app.serializers.user_serialier import UserSerializer

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = Student
        fields = ['id', 'user', 'level']

    def create(self, validate_data):
        user_data = validate_data.pop('user')
        user = UserSerializer.create(UserSerializer(), validated_data=user_data)
        student = Student.objects.create(user= user, **validate_data)
        
        return student