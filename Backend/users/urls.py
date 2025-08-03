from rest_framework.routers import DefaultRouter
from .views import ProfilUtilisateurViewSet

router = DefaultRouter()
router.register(r'profilutilisateurs', ProfilUtilisateurViewSet, basename='profilutilisateur')

urlpatterns = router.urls
