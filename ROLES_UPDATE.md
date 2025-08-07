# Mise à jour des types de compte

## Changements apportés

### Types de compte disponibles

Le système a été simplifié pour ne proposer que **3 types de compte** :

1. **Gestionnaire de Projet** (`GESTIONNAIRE`)
   - Peut créer et gérer des projets
   - Peut modifier les détails des projets
   - Peut voir les analytics et statistiques
   - Peut exporter les données

2. **Administrateur Système** (`ADMINISTRATEUR`)
   - Accès complet à toutes les fonctionnalités
   - Peut créer, modifier et supprimer des projets
   - Peut gérer tous les utilisateurs
   - Peut voir les analytics et statistiques
   - Peut exporter les données

3. **Consultant** (`CONSULTANT`)
   - Peut consulter tous les projets
   - Peut voir les analytics et statistiques
   - Peut exporter les données
   - Accès en lecture seule

### Rôles supprimés

Les rôles suivants ont été supprimés :
- `SUPERVISEUR` → Migré vers `GESTIONNAIRE`
- `OBSERVATEUR` → Migré vers `CONSULTANT`

### Migration des données

Une migration automatique a été créée pour :
- Convertir les utilisateurs `SUPERVISEUR` en `GESTIONNAIRE`
- Convertir les utilisateurs `OBSERVATEUR` en `CONSULTANT`

### Interface utilisateur

Le formulaire d'inscription affiche maintenant :
- Un sélecteur avec les 3 types de compte
- Des informations détaillées sur chaque rôle
- Une interface interactive pour choisir le rôle

### Validation

- Côté frontend : Seuls les 3 rôles sont proposés
- Côté backend : Validation stricte des rôles autorisés
- Messages d'erreur appropriés en cas de rôle invalide

## Test

Pour tester les nouveaux rôles :

```bash
python test_roles.py
```

Ce script créera des utilisateurs de test pour chaque rôle et affichera leurs permissions. 