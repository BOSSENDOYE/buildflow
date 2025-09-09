from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Document
from .serializers import DocumentSerializer
from .services import ProjectExportService
from projects.models import Projet

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [AllowAny]  # Temporairement pour le test
    filterset_fields = ['projet', 'type', 'auteur']
    search_fields = ['nom']
    ordering_fields = ['date_upload', 'nom']
    ordering = ['-date_upload']
    parser_classes = (MultiPartParser, FormParser)
    
    @action(detail=False, methods=['get'], url_path='export-projet/(?P<projet_id>[0-9]+)')
    def export_projet(self, request, projet_id=None):
        """Exporter toutes les informations d'un projet"""
        try:
            projet = get_object_or_404(Projet, id=projet_id)
            
            # Vérifier les permissions (l'utilisateur doit être membre du projet)
            user = request.user
            if not (projet.chef_projet == user or projet.membres.filter(id=user.id).exists()):
                return Response(
                    {"detail": "Vous n'avez pas les permissions pour exporter ce projet."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Créer l'export
            export_service = ProjectExportService(projet)
            return export_service.export_project()
            
        except Projet.DoesNotExist:
            return Response(
                {"detail": "Projet non trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": f"Erreur lors de l'export: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='projet/(?P<projet_id>[0-9]+)')
    def documents_projet(self, request, projet_id=None):
        """Récupérer tous les documents d'un projet spécifique"""
        try:
            projet = get_object_or_404(Projet, id=projet_id)
            
            # Vérifier les permissions
            user = request.user
            if not (projet.chef_projet == user or projet.membres.filter(id=user.id).exists()):
                return Response(
                    {"detail": "Vous n'avez pas les permissions pour accéder aux documents de ce projet."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            documents = Document.objects.filter(projet=projet).order_by('-date_upload')
            serializer = self.get_serializer(documents, many=True)
            
            return Response({
                'projet': {
                    'id': projet.id,
                    'nom': projet.nom,
                    'description': projet.description
                },
                'documents': serializer.data,
                'total_documents': documents.count()
            })
            
        except Projet.DoesNotExist:
            return Response(
                {"detail": "Projet non trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], url_path='types')
    def types(self, request):
        """Récupérer tous les types de documents disponibles"""
        types = [choice[0] for choice in Document.TYPE_CHOICES]
        return Response({'types': types})
    
    @action(detail=False, methods=['get'], url_path='statistiques')
    def statistiques(self, request):
        """Récupérer les statistiques des documents"""
        total_documents = Document.objects.count()
        documents_par_type = {}
        
        for choice in Document.TYPE_CHOICES:
            count = Document.objects.filter(type=choice[0]).count()
            documents_par_type[choice[1]] = count
        
        return Response({
            'total_documents': total_documents,
            'documents_par_type': documents_par_type
        })
