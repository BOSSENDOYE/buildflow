from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfilUtilisateurViewSet

router = DefaultRouter()
router.register(r'profils', ProfilUtilisateurViewSet)

urlpatterns = [
    path('', include(router.urls)),
]