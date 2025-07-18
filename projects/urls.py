from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjetViewSet, PhaseViewSet, BudgetViewSet, RisqueViewSet,
    ActionViewSet, NotificationViewSet, CommentaireViewSet
)

router = DefaultRouter()
router.register(r'projets', ProjetViewSet)
router.register(r'phases', PhaseViewSet)
router.register(r'budgets', BudgetViewSet)
router.register(r'risques', RisqueViewSet)
router.register(r'actions', ActionViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'commentaires', CommentaireViewSet)

urlpatterns = [
    path('', include(router.urls)),
]