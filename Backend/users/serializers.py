from rest_framework import serializers
from .models import ProfilUtilisateur

class ProfilUtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfilUtilisateur
        fields = '__all__'
