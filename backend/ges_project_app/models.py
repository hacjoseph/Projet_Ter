from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator


#Définition des rôles des utilisateurs
ROLE_CHOICES = [
    ('student', 'Étudiant'),
    ('supervisor', 'Encadrant'),
    ('admin', 'Administrateur'),
]

STATUS_CHOICES = [
    ('pending', 'En attente'),
    ('approved', 'Approuvé'),
    ('rejected', 'Rejeté'),
]

LEVEL_CHOICES = [
    ('L2', 'Licence 2'),
    ('L3', 'Licence 3'),
    ('M1', 'Master 1'),
    ('M2', 'Master 2'),
]


class User(AbstractUser):
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.username} ({self.role})"

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student")
    level = models.CharField(max_length=5, choices=LEVEL_CHOICES, default='null')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} ({self.level})"

class Project(models.Model):
    code = models.CharField(max_length=10, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    number_groups = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    supervisor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='project')
    level = models.CharField(max_length=5, choices=LEVEL_CHOICES, default='null')
    priority = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.code} - {self.title} ({self.level})"

class Voeux(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="voeux")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="voeux")
    rank = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    note_preference = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    
    class Meta:
        unique_together = ('student', 'project')  # Un étudiant ne peut noter un projet qu'une seule fois
        ordering = ['student', 'rank']
        
    def __str__(self):
        return f"{self.student} -> {self.project} (Rank: {self.rank}, Note: {self.note_preference})"

class Team(models.Model):
    name = models.CharField(max_length=255)
    min_students = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    max_students = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="teams")
    
    def __str__(self):
        return f"Team {self.name} ({self.project})"


class StudentsTeams(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE,related_name="teams")
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="members")

    def __str__(self):
        return f"{self.student} in {self.team}"
    

class ProjectAssignment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="assignments")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="assignments")
    assignment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')

    class Meta:
        unique_together = ('student', 'project')  # Un étudiant ne peut avoir qu'un seul projet
        indexes = [
        models.Index(fields=['student']),
        models.Index(fields=['project']),
    ]

    def __str__(self):
        return f"Assignment: {self.student} -> {self.project} ({self.statut})"

    
class Deadline(models.Model):
    type = models.CharField(max_length=50, choices=[('voeux', 'Voeux')], default='voeux', unique=True)
    limite_date = models.DateField()
    max_choice = models.PositiveIntegerField(default=5)
    level = models.CharField(max_length=5, choices=LEVEL_CHOICES, default='null')

    def __str__(self):
        return f"Deadline for {self.type}: {self.limite_date}"
    
class ChangeRequest(models.Model):
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="change_requests")
    current_project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)
    current_team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True)
    desired_project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name="requested_changes")
    desired_team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name="requested_changes")
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"Demande de {self.student} ({self.status})"


