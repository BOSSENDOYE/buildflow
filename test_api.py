#!/usr/bin/env python3
"""
Script de test de l'API des projets
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_api():
    print("=== TEST DE L'API DES PROJETS ===\n")
    
    # 1. Test endpoint public
    print("1. TEST ENDPOINT PUBLIC:")
    try:
        response = requests.get(f"{BASE_URL}/projets/public/")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Succès: {len(data.get('results', data))} projets trouvés")
            for projet in data.get('results', data)[:3]:  # Afficher les 3 premiers
                print(f"      - {projet.get('nom', 'N/A')}")
        else:
            print(f"   ❌ Erreur: {response.status_code}")
            print(f"      Réponse: {response.text}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    print()
    
    # 2. Test endpoint authentifié (sans token)
    print("2. TEST ENDPOINT AUTHENTIFIÉ (sans token):")
    try:
        response = requests.get(f"{BASE_URL}/projets/")
        if response.status_code == 401:
            print("   ✅ Correct: Accès refusé sans authentification")
        else:
            print(f"   ❌ Problème: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    print()
    
    # 3. Test authentification
    print("3. TEST AUTHENTIFICATION:")
    try:
        auth_data = {
            "username": "bosse",
            "password": "test123"
        }
        response = requests.post(f"{BASE_URL}/token/", json=auth_data)
        if response.status_code == 200:
            token_data = response.json()
            print("   ✅ Authentification réussie")
            print(f"      Token: {token_data.get('access', 'N/A')[:20]}...")
            
            # Test avec token
            headers = {"Authorization": f"Bearer {token_data['access']}"}
            response = requests.get(f"{BASE_URL}/projets/", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Accès aux projets: {len(data.get('results', data))} projets")
            else:
                print(f"   ❌ Erreur accès projets: {response.status_code}")
        else:
            print(f"   ❌ Échec de l'authentification: {response.status_code}")
            print(f"      Réponse: {response.text}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    print()
    
    # 4. Test des phases
    print("4. TEST DES PHASES:")
    try:
        response = requests.get(f"{BASE_URL}/phases/")
        if response.status_code == 401:
            print("   ✅ Correct: Accès refusé sans authentification")
        else:
            print(f"   ❌ Problème: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    print("\n=== FIN DU TEST API ===")

if __name__ == "__main__":
    test_api()
