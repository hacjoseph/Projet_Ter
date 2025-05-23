
from rest_framework import viewsets
from  ges_project_app.serializers.students_serializer import StudentSerializer
from ges_project_app.models import Student

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer