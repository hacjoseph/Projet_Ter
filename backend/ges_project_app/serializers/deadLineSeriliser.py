from rest_framework import serializers
from ges_project_app.models import Deadline
from rest_framework.response import Response

class DeadlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deadline
        fields = ['id', 'type', 'limite_date', 'max_choice', 'level']
        read_only_fields = ['id']
        extra_kwargs = {
            'type': {'required': True},
            'limite_date': {'required': True}
        }
    def create(self, validated_data):
        """
        Créer une nouvelle instance de Deadline.
        """
        return Deadline.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        """
        Mise à jour d'un deadline.
        """
        instance.type = validated_data.get('type', instance.type)
        instance.limite_date = validated_data.get('limite_date', instance.limite_date)
        instance.max_choice = validated_data.get('max_choice', instance.max_choice)
        instance.level = validated_data.get('level', instance.level)
        instance.save()
        return instance
    