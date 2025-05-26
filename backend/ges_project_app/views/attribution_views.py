from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from collections import defaultdict
from ges_project_app.models import ProjectAssignment, Student, Project
from ges_project_app.attribution import attribution, gale_shapley_attribution, analyser_affectation
from .permissions import IsAdmin,IsAdminUser    

class ProjectAssignmentView(APIView):
    
    permission_classes = [IsAdminUser]
    
    def post(self, request, format=None):
        """
        Lancer l'affectation des étudiants aux projets.
        """
        try:
            level = request.data.get("level")
            algorithm = request.data.get("algorithm", "algo1")  # Valeur par défaut

            if level is None:
                return Response(
                    {"error": "Le paramètre 'level' est requis."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if algorithm == "algo1":
                result = gale_shapley_attribution.affectation_projet(level=level)
            elif algorithm == "algo2":
                result = attribution.affecter_projets(level=level)
            else:
                return Response(
                    {"error": f"Algorithme inconnu : {algorithm}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response(
                {"message": "Affectation terminée avec succès.", "details": result},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    def get(self, request, format=None):
        """
        Récupérer la liste des projets et des étudiants affectés.
        """
        try:
            level = request.query_params.get("level")
            algorithm = request.query_params.get("algorithm", "algo1")  # Par défaut

            if level is None:
                return Response(
                    {"error": "Le paramètre 'level' est requis."},
                    status=status.HTTP_400_BAD_REQUEST
                )


            analyse = analyser_affectation.analyser_affectations(level, algorithm = algorithm)

            return Response(analyse, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )