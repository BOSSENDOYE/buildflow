from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    ProjetViewSet, RisqueViewSet, PhaseViewSet, BudgetViewSet,
    ActionViewSet, NotificationViewSet, CommentaireViewSet, PublicProjetViewSet,
    AuditLogViewSet,
)

router = DefaultRouter()
router.register(r'projets', ProjetViewSet, basename='projet')
router.register(r'risques', RisqueViewSet, basename='risque')
router.register(r'phases', PhaseViewSet, basename='phase')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'actions', ActionViewSet, basename='action')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'commentaires', CommentaireViewSet, basename='commentaire')
router.register(r'audit', AuditLogViewSet, basename='audit')

# Separate URL pattern for public projects to bypass authentication
urlpatterns = [
    path('projets/public/', PublicProjetViewSet.as_view({'get': 'list'}), name='public-projets'),
] + router.urls
