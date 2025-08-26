from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'projets', views.ProjetViewSet)
router.register(r'phases', views.PhaseViewSet)
router.register(r'actions', views.ActionViewSet)
router.register(r'risques', views.RisqueViewSet)
router.register(r'budgets', views.BudgetViewSet)
router.register(r'commentaires', views.CommentaireViewSet)
router.register(r'notifications', views.NotificationViewSet)
router.register(r'audit-logs', views.AuditLogViewSet)
router.register(r'audit-trail', views.AuditTrailViewSet, basename='audit-trail')

urlpatterns = [
    path('', include(router.urls)),
    path('projets/public/', views.PublicProjetViewSet.as_view({'get': 'list'}), name='public-projets'),
]
