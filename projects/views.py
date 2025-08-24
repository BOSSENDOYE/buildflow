from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import models
from .models import Projet, Risque, Phase, Budget, Action, Notification, Commentaire, AuditLog
from .serializers import (
    ProjetSerializer, RisqueSerializer, PhaseSerializer, BudgetSerializer,
    ActionSerializer, NotificationSerializer, CommentaireSerializer, AuditLogSerializer
)
from .utils import create_audit_log

class ProjetViewSet(viewsets.ModelViewSet):
    queryset = Projet.objects.all()
    serializer_class = ProjetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtrer les projets selon les permissions de l'utilisateur"""
        user = self.request.user
        
        if hasattr(user, 'profilutilisateur'):
            if user.profilutilisateur.role == 'ADMINISTRATEUR':
                return Projet.objects.all()
            elif user.profilutilisateur.has_permission('peut_gerer_utilisateurs'):
                return Projet.objects.all()
            else:
                # Utilisateurs normaux voient leurs projets
                return Projet.objects.filter(
                    models.Q(chef_projet=user) | 
                    models.Q(membres=user)
                ).distinct()
        return Projet.objects.none()
    
    def create(self, request, *args, **kwargs):
        """Vérifier les permissions avant la création"""
        user = request.user
        if hasattr(user, 'profilutilisateur'):
            if not user.profilutilisateur.has_permission('peut_creer_projet'):
                return Response({
                    'message': 'Vous n\'avez pas les permissions pour créer un projet.'
                }, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({
                'message': 'Profil utilisateur non trouvé.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        response = super().create(request, *args, **kwargs)
        try:
            instance_id = response.data.get('id')
            if instance_id:
                instance = Projet.objects.get(id=instance_id)
                create_audit_log(user, 'CREATE', instance, before=None)
        except Exception:
            pass
        return response
    
    def update(self, request, *args, **kwargs):
        """Vérifier les permissions avant la modification"""
        user = request.user
        if hasattr(user, 'profilutilisateur'):
            if not user.profilutilisateur.has_permission('peut_modifier_projet'):
                return Response({
                    'message': 'Vous n\'avez pas les permissions pour modifier ce projet.'
                }, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({
                'message': 'Profil utilisateur non trouvé.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        partial = kwargs.get('partial', False)
        instance = self.get_object()
        before = None
        try:
            from django.forms.models import model_to_dict
            before = model_to_dict(instance)
        except Exception:
            pass
        response = super().update(request, *args, **kwargs)
        try:
            instance.refresh_from_db()
            create_audit_log(user, 'UPDATE', instance, before=before)
        except Exception:
            pass
        return response
    
    def destroy(self, request, *args, **kwargs):
        """Vérifier les permissions avant la suppression"""
        user = request.user
        if hasattr(user, 'profilutilisateur'):
            if not user.profilutilisateur.has_permission('peut_supprimer_projet'):
                return Response({
                    'message': 'Vous n\'avez pas les permissions pour supprimer ce projet.'
                }, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({
                'message': 'Profil utilisateur non trouvé.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        instance = self.get_object()
        before = None
        try:
            from django.forms.models import model_to_dict
            before = model_to_dict(instance)
        except Exception:
            pass
        response = super().destroy(request, *args, **kwargs)
        try:
            create_audit_log(user, 'DELETE', instance, before=before, after=None)
        except Exception:
            pass
        return response

class RisqueViewSet(viewsets.ModelViewSet):
    queryset = Risque.objects.all()
    serializer_class = RisqueSerializer
    permission_classes = [IsAuthenticated]

class PhaseViewSet(viewsets.ModelViewSet):
    queryset = Phase.objects.all()
    serializer_class = PhaseSerializer
    permission_classes = [IsAuthenticated]

class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

class ActionViewSet(viewsets.ModelViewSet):
    queryset = Action.objects.all()
    serializer_class = ActionSerializer
    permission_classes = [IsAuthenticated]

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    filterset_fields = ['utilisateur', 'projet', 'type', 'lu']
    ordering = ['-date_creation']

class CommentaireViewSet(viewsets.ModelViewSet):
    queryset = Commentaire.objects.all()
    serializer_class = CommentaireSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['projet', 'auteur']
    ordering = ['-date_creation']


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['resource_type', 'resource_id', 'utilisateur__id', 'action']
    ordering = ['-date_creation']

class PublicProjetViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les projets publics (accessible sans authentification)"""
    queryset = Projet.objects.all()
    serializer_class = ProjetSerializer
    permission_classes = [AllowAny]
    authentication_classes = []  # Disable authentication for this viewset
    
    def get_queryset(self):
        """Retourner tous les projets publics avec informations limitées"""
        queryset = Projet.objects.all()
        
        # Filtrage par région
        region = self.request.query_params.get('region', None)
        if region:
            queryset = queryset.filter(region=region)
        
        # Filtrage par type
        project_type = self.request.query_params.get('type', None)
        if project_type:
            queryset = queryset.filter(type=project_type)
        
        # Filtrage par statut
        statut = self.request.query_params.get('statut', None)
        if statut:
            queryset = queryset.filter(statut=statut)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Retourner les projets avec des données enrichies pour la carte"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Enrichir les données pour la carte
        projects_data = []
        for project in queryset:
            project_data = serializer.data[queryset.index(project)]
            
            # Calculer la progression (exemple basé sur les phases)
            phases = project.phase_set.all()
            if phases.exists():
                completed_phases = phases.filter(statut='TERMINE').count()
                total_phases = phases.count()
                progression = int((completed_phases / total_phases) * 100) if total_phases > 0 else 0
            else:
                progression = 0
            
            # Enrichir les données pour la carte
            project_data['progression'] = progression
            # Remove latitude and longitude fields
            
            projects_data.append(project_data)
        
        return Response(projects_data)
