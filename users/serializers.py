from rest_framework import serializers
from .models import ProfilUtilisateur
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ProfilUtilisateurSerializer(serializers.ModelSerializer):
    utilisateur = UserSerializer(read_only=True)

    class Meta:
        model = ProfilUtilisateur
        fields = '__all__'