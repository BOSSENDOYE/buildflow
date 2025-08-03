from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProfilUtilisateurViewSet, 
    register_user, 
    get_user_permissions, 
    list_all_users, 
    update_user_role, 
    get_roles_info
)

router = DefaultRouter()
router.register(r'profils', ProfilUtilisateurViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register_user, name='register'),
    path('permissions/', get_user_permissions, name='user_permissions'),
    path('users/', list_all_users, name='list_users'),
    path('users/<int:user_id>/role/', update_user_role, name='update_user_role'),
    path('roles/', get_roles_info, name='roles_info'),
]