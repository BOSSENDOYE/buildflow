from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import DocumentViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')

# URLs personnalisées pour les actions spécifiques
urlpatterns = [
    path('projet/<int:projet_id>/', DocumentViewSet.as_view({'get': 'documents_projet'}), name='documents-projet'),
    path('export-projet/<int:projet_id>/', DocumentViewSet.as_view({'get': 'export_projet'}), name='export-projet'),
    path('types/', DocumentViewSet.as_view({'get': 'types'}), name='document-types'),
    path('statistiques/', DocumentViewSet.as_view({'get': 'statistiques'}), name='document-stats'),
] + router.urls
