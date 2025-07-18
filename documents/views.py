from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Document
from .serializers import DocumentSerializer
from projects.models import Action

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        document = serializer.save(auteur=self.request.user)
        Action.objects.create(
            projet=document.projet,
            utilisateur=self.request.user,
            type_action='CREATION',
            description=f"Upload du document {document.nom}",
        )