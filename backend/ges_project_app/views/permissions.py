from rest_framework import permissions

class IsSupervisorOrAdmin(permissions.BasePermission):
    """
    Permission pour les encadrants (supervisors) et les administrateurs uniquement.
    Autorise les opérations de création, mise à jour et suppression.
    Autorise la lecture pour tous les utilisateurs.
    """
    def has_permission(self, request, view):
        # Seuls les encadrants (supervisors) et les administrateurs peuvent créer des projets
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user.is_authenticated and request.user.role in ["admin", "supervisor"]
    
class IsAdmin(permissions.BasePermission):
    """
    Permission pour les administrateurs uniquement.
    Autorise les opérations de création, mise à jour et suppression.
    Autorise la lecture pour tous les utilisateurs.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True  # GET, HEAD, OPTIONS = autorisé pour tous
        return request.user.is_authenticated and request.user.role == "admin"
    
class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'