#!/usr/bin/env python3
"""
Script de diagnostic pour le problème d'affichage des projets
"""

import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'buildflow.settings')
django.setup()

from django.contrib.auth.models import User
from projects.models import Projet
from users.models import ProfilUtilisateur

def test_projects():
    """Test de récupération des projets"""
    print("=== DIAGNOSTIC DES PROJETS ===\n")
    
    # 1. Vérifier les utilisateurs
    print("1. UTILISATEURS:")
    users = User.objects.all()
    print(f"   Total utilisateurs: {users.count()}")
    for user in users:
        print(f"   - {user.username} (ID: {user.id})")
        if hasattr(user, 'profilutilisateur'):
            profil = user.profilutilisateur
            print(f"     Rôle: {profil.role}")
            print(f"     Permissions: {profil.get_permissions()}")
        else:
            print(f"     Pas de profil utilisateur!")
    print()
    
    # 2. Vérifier les projets
    print("2. PROJETS:")
    projets = Projet.objects.all()
    print(f"   Total projets: {projets.count()}")
    for projet in projets:
        print(f"   - {projet.nom} (ID: {projet.id})")
        print(f"     Chef projet: {projet.chef_projet}")
        print(f"     Membres: {list(projet.membres.all())}")
        print(f"     Statut: {projet.statut}")
    print()
    
    # 3. Test de filtrage pour un utilisateur spécifique
    print("3. TEST DE FILTRAGE:")
    if users.exists():
        test_user = users.first()
        print(f"   Test avec utilisateur: {test_user.username}")
        
        # Projets où l'utilisateur est chef
        projets_chef = Projet.objects.filter(chef_projet=test_user)
        print(f"   Projets où il est chef: {projets_chef.count()}")
        
        # Projets où l'utilisateur est membre
        projets_membre = Projet.objects.filter(membres=test_user)
        print(f"   Projets où il est membre: {projets_membre.count()}")
        
        # Union des deux
        from django.db import models
        projets_utilisateur = Projet.objects.filter(
            models.Q(chef_projet=test_user) | 
            models.Q(membres=test_user)
        ).distinct()
        print(f"   Total projets de l'utilisateur: {projets_utilisateur.count()}")
        
        for projet in projets_utilisateur:
            print(f"     - {projet.nom}")
    print()
    
    # 4. Vérifier les relations
    print("4. VÉRIFICATION DES RELATIONS:")
    for projet in projets:
        print(f"   Projet: {projet.nom}")
        if projet.chef_projet:
            print(f"     Chef: {projet.chef_projet.username}")
        else:
            print(f"     Chef: Aucun")
        membres = list(projet.membres.all())
        if membres:
            print(f"     Membres: {[m.username for m in membres]}")
        else:
            print(f"     Membres: Aucun")
    print()
    
    # 5. Suggestions
    print("5. SUGGESTIONS:")
    if projets.count() == 0:
        print("   - Aucun projet dans la base de données")
        print("   - Créez des projets via l'admin Django ou l'API")
    else:
        for projet in projets:
            if not projet.chef_projet and projet.membres.count() == 0:
                print(f"   - Le projet '{projet.nom}' n'a ni chef ni membres")
                print(f"     Il ne sera visible pour aucun utilisateur")
    
    print("\n=== FIN DU DIAGNOSTIC ===")

if __name__ == "__main__":
    test_projects()
