# Plan de remplacement Latitude/Longitude par Région/Département

## Étapes à compléter:

### 1. ✅ Analyse du code existant (COMPLET)
- [x] Examiner le modèle Projet dans `projects/models.py`
- [x] Examiner l'interface Project dans `projectService.ts`
- [x] Examiner le composant ProjectModals dans `ProjectModals.tsx`

### 2. ✅ Backend Changes (COMPLET)
- [x] Modifier `projects/models.py` pour ajouter région/département
- [x] Créer une nouvelle migration Django

### 3. ✅ Frontend Changes (COMPLET)
- [x] Modifier `projectService.ts` pour mettre à jour l'interface Project
- [x] Modifier `ProjectModals.tsx` pour remplacer les champs géolocalisation

### 4. Testing
- [ ] Tester le formulaire de création de projet
- [ ] Vérifier la persistance des données

## Détails des régions/départements du Sénégal à implémenter:

Régions principales du Sénégal:
- Dakar
- Thiès
- Diourbel
- Fatick
- Kaolack
- Kolda
- Louga
- Matam
- Saint-Louis
- Sédhiou
- Tambacounda
- Ziguinchor
- Kaffrine
- Kédougou

Départements par région (exemples):
- Dakar: Dakar, Guédiawaye, Pikine, Rufisque
- Thiès: Thiès, M'bour, Tivaouane
- Saint-Louis: Saint-Louis, Dagana, Podor
- etc.
