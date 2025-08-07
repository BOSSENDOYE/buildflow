from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import models
from .models import Projet, Risque, Phase, Budget, Action, Notification, Commentaire
from .serializers import (
    ProjetSerializer, RisqueSerializer, PhaseSerializer, BudgetSerializer,
    ActionSerializer, NotificationSerializer, CommentaireSerializer
)

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
        
        return super().create(request, *args, **kwargs)
    
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
        
        return super().update(request, *args, **kwargs)
    
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
        
        return super().destroy(request, *args, **kwargs)

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
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

class CommentaireViewSet(viewsets.ModelViewSet):
    queryset = Commentaire.objects.all()
    serializer_class = CommentaireSerializer
    permission_classes = [IsAuthenticated]

class PublicProjetViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les projets publics (accessible sans authentification)"""
    queryset = Projet.objects.all()
    serializer_class = ProjetSerializer
    permission_classes = [AllowAny]
    
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
            
            # Ajouter les coordonnées géographiques (à adapter selon votre modèle)
            # Pour l'exemple, on utilise des coordonnées par défaut
            project_data['progression'] = progression
            project_data['latitude'] = 14.7167  # Coordonnées par défaut du Sénégal
            project_data['longitude'] = -17.4677
            
            projects_data.append(project_data)
        
        return Response(projects_data)
