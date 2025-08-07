#!/usr/bin/env python
"""
Script de test pour vérifier les nouveaux rôles
"""
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'buildflow.settings')
django.setup()

from users.models import ProfilUtilisateur
from django.contrib.auth.models import User

def test_roles():
    """Test des nouveaux rôles"""
    print("=== Test des nouveaux rôles ===")
    
    # Vérifier les choix de rôles disponibles
    role_choices = ProfilUtilisateur._meta.get_field('role').choices
    print(f"Rôles disponibles: {[choice[0] for choice in role_choices]}")
    
    # Créer un utilisateur de test pour chaque rôle
    test_roles = ['GESTIONNAIRE', 'ADMINISTRATEUR', 'CONSULTANT']
    
    for role in test_roles:
        # Créer un utilisateur de test
        username = f"test_{role.lower()}"
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(
                username=username,
                email=f"{username}@test.com",
                password="testpass123",
                first_name=f"Test {role}",
                last_name="User"
            )
            
            # Créer le profil avec le rôle
            profil = ProfilUtilisateur.objects.create(
                utilisateur=user,
                role=role
            )
            
            # Tester les permissions
            permissions = profil.get_permissions()
            print(f"\n--- {role} ---")
            print(f"Utilisateur: {user.username}")
            print(f"Permissions: {permissions}")
            
            # Vérifier les permissions spécifiques
            print(f"Peut créer projet: {permissions['peut_creer_projet']}")
            print(f"Peut modifier projet: {permissions['peut_modifier_projet']}")
            print(f"Peut supprimer projet: {permissions['peut_supprimer_projet']}")
            print(f"Peut gérer utilisateurs: {permissions['peut_gerer_utilisateurs']}")
            print(f"Peut voir analytics: {permissions['peut_voir_analytics']}")
            print(f"Peut exporter données: {permissions['peut_exporter_donnees']}")
        else:
            print(f"Utilisateur {username} existe déjà")

if __name__ == "__main__":
    test_roles() 