#!/usr/bin/env python3
"""
Script de test pour l'API des projets
"""

import requests
import json

def test_api():
    """Tester l'API des projets"""
    print("=== TEST DE L'API DES PROJETS ===\n")
    
    base_url = "http://localhost:8000/api"
    
    # 1. Test de l'endpoint public (sans authentification)
    print("1. TEST ENDPOINT PUBLIC:")
    try:
        response = requests.get(f"{base_url}/projets/public/")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Succès: {len(data)} projets trouvés")
            for projet in data[:3]:  # Afficher les 3 premiers
                print(f"     - {projet.get('nom', 'N/A')}")
        else:
            print(f"   ❌ Erreur: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erreur de connexion: {e}")
    print()
    
    # 2. Test de l'endpoint authentifié (sans token)
    print("2. TEST ENDPOINT AUTHENTIFIÉ (sans token):")
    try:
        response = requests.get(f"{base_url}/projets/")
        if response.status_code == 401:
            print("   ✅ Correct: Accès refusé sans authentification")
        else:
            print(f"   ⚠️  Inattendu: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erreur de connexion: {e}")
    print()
    
    # 3. Test de l'endpoint d'authentification
    print("3. TEST AUTHENTIFICATION:")
    try:
        # Essayer de se connecter avec un utilisateur existant
        auth_data = {
            "username": "bosse",
            "password": "test123"  # Mot de passe par défaut
        }
        response = requests.post(f"{base_url}/token/", json=auth_data)
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access')
            print(f"   ✅ Authentification réussie")
            print(f"   Token: {access_token[:20]}...")
            
            # 4. Test de l'endpoint des projets avec token
            print("\n4. TEST ENDPOINT PROJETS (avec token):")
            headers = {"Authorization": f"Bearer {access_token}"}
            response = requests.get(f"{base_url}/projets/", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and 'results' in data:
                    projets = data['results']
                else:
                    projets = data
                
                print(f"   ✅ Succès: {len(projets)} projets trouvés")
                for projet in projets:
                    print(f"     - {projet.get('nom', 'N/A')} (ID: {projet.get('id', 'N/A')})")
                    print(f"       Chef: {projet.get('chef_projet', 'N/A')}")
                    print(f"       Statut: {projet.get('statut', 'N/A')}")
            else:
                print(f"   ❌ Erreur: {response.status_code}")
                print(f"   Réponse: {response.text}")
        else:
            print(f"   ❌ Échec de l'authentification: {response.status_code}")
            print(f"   Réponse: {response.text}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    print("\n=== FIN DU TEST API ===")

if __name__ == "__main__":
    test_api()
