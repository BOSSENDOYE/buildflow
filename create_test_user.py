#!/usr/bin/env python
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'buildflow.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import ProfilUtilisateur

def create_test_user():
    """Créer un utilisateur de test pour le développement"""
    
    # Vérifier si l'utilisateur existe déjà
    username = 'testuser'
    email = 'test@buildflow.com'
    
    if User.objects.filter(username=username).exists():
        print(f"L'utilisateur '{username}' existe déjà.")
        return
    
    # Créer l'utilisateur
    user = User.objects.create_user(
        username=username,
        email=email,
        password='testpass123',
        first_name='Test',
        last_name='User'
    )
    
    # Créer le profil utilisateur
    profil = ProfilUtilisateur.objects.create(
        utilisateur=user,
        role='GESTIONNAIRE'
    )
    
    print(f"Utilisateur de test créé avec succès!")
    print(f"Nom d'utilisateur: {username}")
    print(f"Mot de passe: testpass123")
    print(f"Email: {email}")
    print(f"Rôle: {profil.role}")

if __name__ == '__main__':
    create_test_user() 