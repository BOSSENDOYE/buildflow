from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Projet, Phase, Budget, Risque, Action, Notification, Commentaire
from .serializers import (
    ProjetSerializer, PhaseSerializer, BudgetSerializer, RisqueSerializer,
    ActionSerializer, NotificationSerializer, CommentaireSerializer
)

class ProjetViewSet(viewsets.ModelViewSet):
    queryset = Projet.objects.all()
    serializer_class = ProjetSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['statut', 'chef_projet', 'date_debut', 'date_fin_prevue']
    search_fields = ['nom', 'description']
    ordering_fields = ['nom', 'date_debut', 'date_fin_prevue', 'statut']
    ordering = ['-date_creation']

    def perform_create(self, serializer):
        projet = serializer.save(chef_projet=self.request.user)
        # Créer une notification pour les membres
        Notification.objects.create(
            utilisateur=self.request.user,
            projet=projet,
            type='SUCCESS',
            titre='Nouveau projet créé',
            message=f'Le projet "{projet.nom}" a été créé avec succès.'
        )

    def perform_update(self, serializer):
        projet = self.get_object()
        serializer.save()
        # Créer une notification pour les modifications importantes
        Notification.objects.create(
            utilisateur=self.request.user,
            projet=projet,
            type='INFO',
            titre='Projet modifié',
            message=f'Le projet "{projet.nom}" a été modifié.'
        )

    @action(detail=True, methods=['get'])
    def statistiques(self, request, pk=None):
        """Obtenir les statistiques d'un projet"""
        projet = self.get_object()
        return Response({
            'phases_count': projet.phases.count(),
            'actions_count': projet.actions.count(),
            'risques_count': projet.risques.count(),
            'budgets_count': projet.budgets.count(),
            'commentaires_count': projet.commentaires.count(),
        })

    @action(detail=True, methods=['get'])
    def phases(self, request, pk=None):
        """Obtenir toutes les phases d'un projet"""
        projet = self.get_object()
        phases = projet.phases.all()
        serializer = PhaseSerializer(phases, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def actions(self, request, pk=None):
        """Obtenir toutes les actions d'un projet"""
        projet = self.get_object()
        actions = projet.actions.all()
        serializer = ActionSerializer(actions, many=True)
        return Response(serializer.data)

class PhaseViewSet(viewsets.ModelViewSet):
    queryset = Phase.objects.all()
    serializer_class = PhaseSerializer
    permission_classes = [IsAuthenticated]

class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

class RisqueViewSet(viewsets.ModelViewSet):
    queryset = Risque.objects.all()
    serializer_class = RisqueSerializer
    permission_classes = [IsAuthenticated]

class ActionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Action.objects.all()
    serializer_class = ActionSerializer
    permission_classes = [IsAuthenticated]

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(utilisateur=self.request.user)

class CommentaireViewSet(viewsets.ModelViewSet):
    queryset = Commentaire.objects.all()
    serializer_class = CommentaireSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        commentaire = serializer.save(utilisateur=self.request.user)
        Action.objects.create(
            projet=commentaire.projet,
            utilisateur=self.request.user,
            type_action='COMMENTAIRE',
            description=f"Nouveau commentaire sur {commentaire.projet.nom}",
        )