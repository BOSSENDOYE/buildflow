# Guide de Gestion des Phases - BuildFlow

## 🎯 Vue d'ensemble

Ce guide détaille les fonctionnalités avancées de gestion des phases dans BuildFlow, permettant à chaque projet d'avoir ses propres phases individuelles avec un contrôle complet sur leur ordre, statut et progression.

## ✨ Fonctionnalités Principales

### 1. **Phases Individuelles par Projet**
- Chaque projet possède ses propres phases
- Ordre unique et personnalisable pour chaque projet
- Gestion indépendante des statuts et dates

### 2. **Statistiques en Temps Réel**
- **Total des phases** : Nombre total de phases du projet
- **Phases terminées** : Phases avec statut "TERMINEE"
- **Phases en cours** : Phases avec statut "EN_COURS"
- **Phases en attente** : Phases avec statut "EN_ATTENTE"
- **Progression globale** : Pourcentage de phases terminées

### 3. **Gestion des Statuts**
- **EN_ATTENTE** : Phase planifiée mais pas encore commencée
- **EN_COURS** : Phase actuellement en cours d'exécution
- **TERMINEE** : Phase achevée avec succès
- Changement de statut en temps réel via l'interface

### 4. **Réorganisation des Phases**
- Interface de glisser-déposer pour réorganiser l'ordre
- Mise à jour automatique des numéros d'ordre
- Sauvegarde immédiate des changements

## 🏗️ Architecture Technique

### Backend (Django)

#### Modèles
```python
class Phase(models.Model):
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='phases')
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES)
    date_debut = models.DateField()
    date_fin_prevue = models.DateField()
    ordre = models.PositiveIntegerField()
```

#### API Endpoints
- `GET /api/phases/project_phases/?projet_id={id}` : Récupérer les phases d'un projet avec statistiques
- `POST /api/phases/{id}/change_status/` : Changer le statut d'une phase
- `POST /api/phases/reorder_phases/` : Réorganiser l'ordre des phases
- `GET /api/phases/` : Lister toutes les phases (avec filtres par projet)
- `POST /api/phases/` : Créer une nouvelle phase
- `PUT /api/phases/{id}/` : Modifier une phase existante
- `DELETE /api/phases/{id}/` : Supprimer une phase

#### Permissions
- **Staff** : Accès complet à tous les projets et phases
- **Chef de projet** : Gestion des phases de ses projets
- **Membres** : Consultation des phases des projets auxquels ils participent

### Frontend (React)

#### Composants Principaux
- `ProjectPhasesView` : Vue principale de gestion des phases
- `PhaseModal` : Modal de création/modification de phase
- `PhaseReorderModal` : Interface de réorganisation par glisser-déposer
- `GanttChart` : Diagramme de Gantt des phases

#### Services
```typescript
// projectService.ts
async getProjectPhases(projectId: number): Promise<ProjectPhasesData>
async changePhaseStatus(phaseId: number, newStatus: string): Promise<StatusChangeResult>
async reorderPhases(projectId: number, phasesOrder: Array<{id: number, ordre: number}>): Promise<ReorderResult>
```

## 🚀 Utilisation

### 1. **Accéder à la Gestion des Phases**
1. Ouvrir le tableau de bord principal
2. Sélectionner un projet dans la liste
3. Cliquer sur l'onglet "Phases"

### 2. **Créer une Nouvelle Phase**
1. Cliquer sur le bouton "Nouvelle Phase"
2. Remplir les informations :
   - **Nom** : Nom de la phase
   - **Description** : Description détaillée (optionnel)
   - **Date de début** : Date de commencement
   - **Date de fin prévue** : Date de fin estimée
   - **Statut** : EN_ATTENTE par défaut
3. Cliquer sur "Créer"

### 3. **Modifier le Statut d'une Phase**
1. Dans la liste des phases, utiliser le menu déroulant de statut
2. Sélectionner le nouveau statut
3. Le changement est appliqué immédiatement

### 4. **Réorganiser les Phases**
1. Cliquer sur le bouton "Réorganiser"
2. Glisser-déposer les phases dans l'ordre souhaité
3. Cliquer sur "Sauvegarder" pour appliquer les changements

### 5. **Modifier une Phase**
1. Cliquer sur l'icône d'édition (crayon) de la phase
2. Modifier les informations souhaitées
3. Cliquer sur "Modifier"

### 6. **Supprimer une Phase**
1. Cliquer sur l'icône de suppression (poubelle) de la phase
2. Confirmer la suppression

## 📊 Statistiques et Métriques

### Calcul de la Progression
```python
progression = (phases_terminees / total_phases) * 100
```

### Types de Statistiques
- **Quantitatives** : Nombre de phases par statut
- **Temporelles** : Dates de début et fin des phases
- **Qualitatives** : Statut et ordre des phases

## 🔒 Sécurité et Permissions

### Vérifications de Sécurité
- Validation des permissions utilisateur
- Vérification de l'appartenance au projet
- Protection contre les modifications non autorisées

### Audit et Traçabilité
- Logs de toutes les actions sur les phases
- Historique des changements de statut
- Traçabilité des réorganisations

## 🐛 Dépannage

### Problèmes Courants

#### 1. **Phases non visibles**
- Vérifier que l'utilisateur a accès au projet
- Contrôler les permissions utilisateur
- Vérifier la connexion à la base de données

#### 2. **Erreur lors de la création de phase**
- Vérifier que tous les champs obligatoires sont remplis
- Contrôler que le projet_id est valide
- Vérifier les permissions de création

#### 3. **Problème de réorganisation**
- S'assurer qu'il y a au moins 2 phases
- Vérifier que l'ordre est unique
- Contrôler les permissions de modification

#### 4. **Statistiques incorrectes**
- Rafraîchir la page
- Vérifier la cohérence des données en base
- Contrôler les statuts des phases

### Logs et Debugging
```python
# Dans Django
import logging
logger = logging.getLogger(__name__)
logger.info(f"Phase {phase.nom} modifiée")

# Dans le frontend
console.log('Phase data:', phaseData);
```

## 🔄 Maintenance

### Tâches Régulières
- Vérification de la cohérence des ordres
- Nettoyage des phases obsolètes
- Mise à jour des statistiques

### Optimisations
- Indexation des champs fréquemment utilisés
- Mise en cache des statistiques
- Pagination des listes de phases

## 🚀 Évolutions Futures

### Fonctionnalités Prévues
- **Dépendances entre phases** : Gestion des prérequis
- **Templates de phases** : Modèles réutilisables
- **Notifications automatiques** : Alertes de changement de statut
- **Intégration calendrier** : Synchronisation avec les outils externes
- **Rapports avancés** : Analyses détaillées de progression

### Améliorations Techniques
- **API GraphQL** : Requêtes plus flexibles
- **WebSockets** : Mises à jour en temps réel
- **Cache distribué** : Performance améliorée
- **Tests automatisés** : Couverture de code étendue

## 📚 Ressources Additionnelles

### Documentation API
- [Documentation Django REST Framework](https://www.django-rest-framework.org/)
- [Guide des permissions Django](https://docs.djangoproject.com/en/stable/topics/auth/)

### Composants Frontend
- [Documentation React](https://reactjs.org/docs/)
- [Guide TypeScript](https://www.typescriptlang.org/docs/)

### Outils de Développement
- [Django Debug Toolbar](https://django-debug-toolbar.readthedocs.io/)
- [React Developer Tools](https://reactjs.org/blog/2015/09/02/new-react-developer-tools.html)

---

**Version** : 1.0  
**Dernière mise à jour** : Janvier 2024  
**Auteur** : Équipe BuildFlow

