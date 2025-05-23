from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from ges_project_app.models import User, Student

class UserSerializer(serializers.ModelSerializer):
    level = serializers.CharField(write_only=True, required=False)
    full_name = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False)
    class Meta:
        model = User
        fields = ['id', 'username','email', 'first_name', 'last_name', 'full_name', 'role', 'password','level']
        extra_kwargs = {
            'password': {'write_only': True}
        }
        
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
        
    def create(self, validated_data):
        
        level = validated_data.pop('level', None)
        password = validated_data.pop('password', None)
        
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Si l'utilisateur est un étudiant,
        if user.role == 'student' and level:
            Student.objects.create(user=user, level=level)
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance