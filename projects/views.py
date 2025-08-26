from rest_framework import viewsets, status, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import datetime, timedelta
import json

from .models import Projet, Risque, Phase, Budget, Action, Notification, Commentaire, AuditLog, AuditTrail
from .serializers import (
    ProjetSerializer, RisqueSerializer, PhaseSerializer, BudgetSerializer,
    ActionSerializer, NotificationSerializer, CommentaireSerializer, AuditLogSerializer,
    AuditTrailSerializer, AuditTrailListSerializer
)
from .utils import create_audit_log
from .services import ProjectExportService

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

class AuditTrailViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour la traçabilité et l'audit"""
    
    queryset = AuditTrail.objects.all()
    serializer_class = AuditTrailListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['action', 'resource_type', 'user', 'projet']
    search_fields = ['resource_name', 'description', 'user__username']
    ordering_fields = ['timestamp', 'action', 'resource_type']
    ordering = ['-timestamp']
    
    def get_queryset(self):
        """Filtrer les audits selon les permissions de l'utilisateur"""
        queryset = super().get_queryset()
        
        # Si l'utilisateur n'est pas admin, filtrer par ses projets
        if not self.request.user.is_staff:
            user_projects = Projet.objects.filter(
                Q(chef_projet=self.request.user) | Q(membres=self.request.user)
            ).distinct()
            queryset = queryset.filter(projet__in=user_projects)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def project_history(self, request):
        """Récupérer l'historique complet d'un projet"""
        projet_id = request.query_params.get('projet_id')
        if not projet_id:
            return Response(
                {'error': 'ID du projet requis'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            projet = Projet.objects.get(id=projet_id)
            
            # Vérifier les permissions
            if not (request.user.is_staff or 
                   projet.chef_projet == request.user or 
                   request.user in projet.membres.all()):
                return Response(
                    {'error': 'Accès non autorisé'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Récupérer tous les audits liés au projet
            audits = AuditTrail.objects.filter(projet=projet).order_by('-timestamp')
            
            # Grouper par type de ressource
            grouped_audits = {}
            for audit in audits:
                resource_type = audit.resource_type
                if resource_type not in grouped_audits:
                    grouped_audits[resource_type] = []
                grouped_audits[resource_type].append(AuditTrailSerializer(audit).data)
            
            # Statistiques
            stats = {
                'total_actions': audits.count(),
                'actions_by_type': audits.values('action').annotate(count=Count('id')),
                'actions_by_resource': audits.values('resource_type').annotate(count=Count('id')),
                'actions_by_user': audits.values('user__username').annotate(count=Count('id')),
                'recent_activity': audits.filter(
                    timestamp__gte=timezone.now() - timedelta(days=7)
                ).count()
            }
            
            return Response({
                'projet': {
                    'id': projet.id,
                    'nom': projet.nom,
                    'statut': projet.statut
                },
                'statistiques': stats,
                'historique_par_type': grouped_audits,
                'historique_complet': AuditTrailSerializer(audits, many=True).data
            })
            
        except Projet.DoesNotExist:
            return Response(
                {'error': 'Projet non trouvé'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def user_activity(self, request):
        """Récupérer l'activité d'un utilisateur"""
        user_id = request.query_params.get('user_id', request.user.id)
        
        # Vérifier les permissions
        if str(user_id) != str(request.user.id) and not request.user.is_staff:
            return Response(
                {'error': 'Accès non autorisé'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Récupérer l'activité de l'utilisateur
        audits = AuditTrail.objects.filter(user_id=user_id).order_by('-timestamp')
        
        # Statistiques par période
        now = timezone.now()
        periods = {
            'aujourd_hui': audits.filter(timestamp__date=now.date()).count(),
            'cette_semaine': audits.filter(timestamp__gte=now - timedelta(days=7)).count(),
            'ce_mois': audits.filter(timestamp__gte=now - timedelta(days=30)).count(),
            'total': audits.count()
        }
        
        # Actions par type
        actions_by_type = audits.values('action').annotate(count=Count('id'))
        
        # Projets sur lesquels l'utilisateur a travaillé
        projets_actifs = audits.values('projet__nom', 'projet__id').distinct()
        
        return Response({
            'utilisateur': {
                'id': request.user.id,
                'username': request.user.username
            },
            'statistiques': periods,
            'actions_par_type': actions_by_type,
            'projets_actifs': projets_actifs,
            'activite_recente': AuditTrailListSerializer(audits[:50], many=True).data
        })
    
    @action(detail=False, methods=['get'])
    def system_overview(self, request):
        """Vue d'ensemble de l'activité du système (admin seulement)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Accès réservé aux administrateurs'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        now = timezone.now()
        
        # Statistiques globales
        stats = {
            'total_actions': AuditTrail.objects.count(),
            'actions_aujourd_hui': AuditTrail.objects.filter(
                timestamp__date=now.date()
            ).count(),
            'actions_cette_semaine': AuditTrail.objects.filter(
                timestamp__gte=now - timedelta(days=7)
            ).count(),
            'utilisateurs_actifs': AuditTrail.objects.filter(
                timestamp__gte=now - timedelta(days=7)
            ).values('user').distinct().count(),
            'projets_actifs': AuditTrail.objects.filter(
                timestamp__gte=now - timedelta(days=7)
            ).values('projet').distinct().count()
        }
        
        # Actions par type
        actions_by_type = AuditTrail.objects.values('action').annotate(count=Count('id'))
        
        # Activité par ressource
        activity_by_resource = AuditTrail.objects.values('resource_type').annotate(count=Count('id'))
        
        # Utilisateurs les plus actifs
        top_users = AuditTrail.objects.values('user__username').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        return Response({
            'statistiques_globales': stats,
            'actions_par_type': actions_by_type,
            'activite_par_ressource': activity_by_resource,
            'utilisateurs_plus_actifs': top_users
        })
    
    @action(detail=False, methods=['get'])
    def export_audit(self, request):
        """Exporter les données d'audit (admin seulement)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Accès réservé aux administrateurs'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Paramètres de filtrage
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        action_type = request.query_params.get('action')
        resource_type = request.query_params.get('resource_type')
        
        queryset = self.get_queryset()
        
        # Appliquer les filtres
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        if action_type:
            queryset = queryset.filter(action=action_type)
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
        
        # Limiter le nombre de résultats pour l'export
        queryset = queryset[:10000]  # Max 10k enregistrements
        
        # Préparer les données pour l'export
        export_data = []
        for audit in queryset:
            export_data.append({
                'Date': audit.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'Action': audit.get_action_display(),
                'Utilisateur': audit.user.username if audit.user else 'Système',
                'Type_Ressource': audit.resource_type,
                'Nom_Ressource': audit.resource_name,
                'ID_Ressource': audit.resource_id,
                'Projet': audit.projet.nom if audit.projet else 'N/A',
                'Description': audit.description,
                'IP': audit.ip_address or 'N/A',
                'Données_Avant': json.dumps(audit.data_before) if audit.data_before else 'N/A',
                'Données_Après': json.dumps(audit.data_after) if audit.data_after else 'N/A'
            })
        
        return Response({
            'message': f'Export de {len(export_data)} enregistrements',
            'total_records': len(export_data),
            'filtres_appliques': {
                'start_date': start_date,
                'end_date': end_date,
                'action': action_type,
                'resource_type': resource_type
            },
            'donnees': export_data
        })
