from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import ProfilUtilisateur
from .serializers import ProfilUtilisateurSerializer

class ProfilUtilisateurViewSet(viewsets.ModelViewSet):
    queryset = ProfilUtilisateur.objects.all()
    serializer_class = ProfilUtilisateurSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profilutilisateur'):
            if user.profilutilisateur.role != 'ADMINISTRATEUR':
                return ProfilUtilisateur.objects.filter(utilisateur=user)
            return ProfilUtilisateur.objects.all()
        else:
            # User has no profilutilisateur, return empty queryset or handle as needed
            return ProfilUtilisateur.objects.none()
