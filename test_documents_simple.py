#!/usr/bin/env python
"""
Test simple de l'API des documents
"""

import requests
import json

# Configuration
BASE_URL = "http://127.0.0.1:8000"
API_BASE = f"{BASE_URL}/api"

def test_documents_simple():
    """Test simple de l'API des documents"""
    
    print("🧪 Test simple de l'API des documents")
    print("=" * 50)
    
    # 1. Test de récupération des documents d'un projet (sans auth)
    print("\n1️⃣ Test récupération documents d'un projet (sans auth)")
    try:
        response = requests.get(f"{API_BASE}/documents/projet/1/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Succès: {len(data.get('documents', []))} documents trouvés")
        elif response.status_code == 401:
            print("❌ Erreur 401: Authentification requise")
        elif response.status_code == 403:
            print("❌ Erreur 403: Permissions insuffisantes")
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # 2. Test de récupération de tous les documents (sans auth)
    print("\n2️⃣ Test récupération tous les documents (sans auth)")
    try:
        response = requests.get(f"{API_BASE}/documents/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            documents = data.get('results', data)
            print(f"✅ Succès: {len(documents)} documents trouvés")
        elif response.status_code == 401:
            print("❌ Erreur 401: Authentification requise")
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # 3. Test de récupération des types de documents (sans auth)
    print("\n3️⃣ Test récupération types de documents (sans auth)")
    try:
        response = requests.get(f"{API_BASE}/documents/types/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Succès: Types disponibles: {data.get('types', [])}")
        elif response.status_code == 401:
            print("❌ Erreur 401: Authentification requise")
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Test simple terminé")

if __name__ == '__main__':
    test_documents_simple()



