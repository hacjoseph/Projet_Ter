
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (TokenObtainPairView,TokenRefreshView,)
from ges_project_app.views.user_view import UserViewSet
from ges_project_app.views.student_views import StudentViewSet
from ges_project_app.views.project_views import ProjectViewSet, TeamViewSet, ProjectWithTeamsView
from ges_project_app.views.voeux_views import VoeuxViewSet
from ges_project_app.views.attribution_views import ProjectAssignmentView
from ges_project_app.views.assignStudentToTeamView import AssignStudentsToTeamsView
from ges_project_app.views.deadLineView import DeadlineViewSet
from ges_project_app.views.change_request_views import ChangeRequestViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'projects',ProjectViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'voeux', VoeuxViewSet)
router.register(r'students', StudentViewSet)
router.register(r'deadlines', DeadlineViewSet)
router.register(r'change-requests', ChangeRequestViewSet)




urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/projects-assign/', ProjectAssignmentView.as_view(), name='projects-assign'),
    path("api/projects-with-teams/", ProjectWithTeamsView.as_view(), name="projects-with-teams"),
    path('api/assign-student-team/', AssignStudentsToTeamsView.as_view(), name="assign-student-team"),
    # path('create-user/', create_user, name='create_user'),
    path('api/', include(router.urls)),
    
]
