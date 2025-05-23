import random
from faker import Faker
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from ges_project_app.models import User, Student, Project, Voeux

# Constantes pour les choix
LEVEL_CHOICES = ['L1', 'L2', 'L3', 'M1', 'M2']  # Exemple de niveaux
ROLE_CHOICES = ['student', 'supervisor']  # Rôles disponibles

fake = Faker()

class Command(BaseCommand):
    help = "Génère des données de test pour les utilisateurs, étudiants, projets et préférences."

    def handle(self, *args, **kwargs):
        self.stdout.write("Génération des données de test...")

        # 1. Créer des utilisateurs (étudiants et superviseurs)
        # users = []
        # for _ in range(50):  # Générer 50 utilisateurs (étudiants)
        #     user = User.objects.create(
        #         username=fake.unique.user_name(),
        #         email=fake.unique.email(),
        #         password=make_password("password"),  # Mot de passe par défaut
        #         role='student',  # Rôle étudiant
        #     )
        #     users.append(user)
        # self.stdout.write(f"{len(users)} utilisateurs (étudiants) créés.")

        # # 2. Créer des étudiants associés aux utilisateurs
        studentsl = []
        # for user in users:
        #     student = Student.objects.create(
        #         user=user,
        #         level=random.choice(LEVEL_CHOICES),  # Niveau aléatoire
        #     )
        #     students.append(student)
        # self.stdout.write(f"{len(students)} étudiants créés.")

        # # 3. Créer des superviseurs (utilisateurs avec le rôle 'supervisor')
        # supervisors = []
        # for _ in range(5):  # Générer 5 superviseurs
        #     supervisor_user = User.objects.create(
        #         username=fake.unique.user_name(),
        #         email=fake.unique.email(),
        #         password=make_password("password"),  # Mot de passe par défaut
        #         role='supervisor',  # Rôle superviseur
        #     )
        #     supervisors.append(supervisor_user)
        # self.stdout.write(f"{len(supervisors)} superviseurs créés.")

        # # 4. Créer des projets associés aux superviseurs
        projectsl = []
        # for _ in range(10):  # Générer 10 projets
        #     project = Project.objects.create(
        #         code=fake.unique.bothify("P??###"),  # Code unique (ex: PAB123)
        #         title=fake.catch_phrase(),
        #         description=fake.text(),
        #         number_groups=random.randint(1, 5),  # Nombre de groupes aléatoire
        #         supervisor=random.choice(supervisors),  # Superviseur aléatoire
        #         level=random.choice(LEVEL_CHOICES),  # Niveau aléatoire
        #     )
        #     projects.append(project)
        # self.stdout.write(f"{len(projects)} projets créés.")

        # 5. Créer des préférences pour chaque étudiant
        
        students = Student.objects.all()
        projects = Project.objects.all()

        # Pas besoin de faire une copie des listes via une boucle, on peut les utiliser directement
        for student in students:
            # Projets correspondant au niveau de l'étudiant
            available_projects = [p for p in projects if p.level == student.level]
            random.shuffle(available_projects)
            
            # Prendre au maximum 5 projets
            chosen_projects = available_projects[:5]
            
            for i, project in enumerate(chosen_projects):
                if not Voeux.objects.filter(student=student, project=project).exists():
                    Voeux.objects.create(
                        student=student,
                        project=project,
                        rank=i + 1,
                        note_preference=random.randint(1, 20),  # Note entre 1 et 20
                    )

        self.stdout.write(f"Préférences créées pour {len(students)} étudiants.")
        self.stdout.write(self.style.SUCCESS("Données de test générées avec succès !"))
