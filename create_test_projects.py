#!/usr/bin/env python3
"""
Script pour créer des projets de test
"""

import os
import sys
import django
from datetime import date, timedelta

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'buildflow.settings')
django.setup()

from django.contrib.auth.models import User
from projects.models import Projet
from users.models import ProfilUtilisateur

def create_test_projects():
    """Créer des projets de test"""
    print("=== CRÉATION DE PROJETS DE TEST ===\n")
    
    # Récupérer les utilisateurs
    users = User.objects.all()
    if not users.exists():
        print("Aucun utilisateur trouvé. Créez d'abord des utilisateurs.")
        return
    
    # Créer un profil pour l'utilisateur bosse s'il n'en a pas
    bosse = User.objects.filter(username='bosse').first()
    if bosse and not hasattr(bosse, 'profilutilisateur'):
        profil = ProfilUtilisateur.objects.create(
            utilisateur=bosse,
            role='GESTIONNAIRE'
        )
        print(f"Profil créé pour {bosse.username}")
    
    # Utilisateur pour les tests
    test_user = users.first()
    print(f"Utilisateur de test: {test_user.username}")
    
    # Dates de test
    today = date.today()
    start_date = today
    end_date = today + timedelta(days=90)
    
    # Projet 1: Résidence Les Jardins
    projet1 = Projet.objects.create(
        nom="Résidence Les Jardins",
        description="Construction d'une résidence moderne de 50 appartements avec espaces verts",
        date_debut=start_date,
        date_fin_prevue=end_date,
        statut='EN_COURS',
        budget_prevue=250000000,
        budget_reel=0,
        chef_projet=test_user,
        nom_entreprise="Construction Plus SARL",
        latitude=14.7167,
        longitude=-17.4677
    )
    projet1.membres.add(test_user)
    print(f"Projet créé: {projet1.nom}")
    
    # Projet 2: Centre Commercial Le Forum
    projet2 = Projet.objects.create(
        nom="Centre Commercial Le Forum",
        description="Construction d'un centre commercial de 3 étages avec parking souterrain",
        date_debut=start_date + timedelta(days=30),
        date_fin_prevue=end_date + timedelta(days=30),
        statut='EN_ATTENTE',
        budget_prevue=500000000,
        budget_reel=0,
        chef_projet=test_user,
        nom_entreprise="Développement Urbain SA",
        latitude=14.7267,
        longitude=-17.4577
    )
    projet2.membres.add(test_user)
    print(f"Projet créé: {projet2.nom}")
    
    # Projet 3: Pont de la Rivière
    projet3 = Projet.objects.create(
        nom="Pont de la Rivière",
        description="Construction d'un pont de 200m pour relier deux quartiers",
        date_debut=start_date - timedelta(days=60),
        date_fin_prevue=end_date - timedelta(days=30),
        statut='EN_COURS',
        budget_prevue=150000000,
        budget_reel=120000000,
        chef_projet=test_user,
        nom_entreprise="Infrastructure Nationale",
        latitude=14.7067,
        longitude=-17.4777
    )
    projet3.membres.add(test_user)
    print(f"Projet créé: {projet3.nom}")
    
    print(f"\nTotal projets créés: {Projet.objects.count()}")
    print("=== PROJETS DE TEST CRÉÉS AVEC SUCCÈS ===")

if __name__ == "__main__":
    create_test_projects()
