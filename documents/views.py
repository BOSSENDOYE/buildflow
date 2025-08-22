from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Document
from .serializers import DocumentSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['projet', 'type', 'auteur']
    search_fields = ['nom']
    ordering_fields = ['date_upload', 'nom']
    ordering = ['-date_upload']
    parser_classes = (MultiPartParser, FormParser)
