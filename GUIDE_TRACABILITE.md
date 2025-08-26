# 📋 Guide de la Fonctionnalité de Traçabilité

## 🎯 **Vue d'ensemble**

La fonctionnalité de traçabilité de BuildFlow permet de suivre et d'auditer toutes les actions effectuées dans le système. Elle enregistre automatiquement :

- **Créations, modifications et suppressions** de données
- **Connexions et déconnexions** des utilisateurs
- **Uploads et téléchargements** de documents
- **Changements de statut** des projets et phases
- **Exports et imports** de données
- **Attributions** et **commentaires**

## 🏗️ **Architecture Technique**

### **Backend (Django)**

#### **Modèle AuditTrail**
```python
class AuditTrail(models.Model):
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    resource_type = models.CharField(max_length=100)
    resource_name = models.CharField(max_length=255)
    resource_id = models.PositiveIntegerField()
    projet = models.ForeignKey('Projet', on_delete=models.CASCADE, null=True, blank=True)
    description = models.TextField(blank=True)
    data_before = models.JSONField(null=True, blank=True)
    data_after = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    session_id = models.CharField(max_length=100, blank=True, null=True)
    context = models.JSONField(null=True, blank=True)
```

#### **Service AuditService**
- **`log_action()`** : Enregistrement générique d'action
- **`log_project_creation()`** : Création de projet
- **`log_project_update()`** : Modification de projet
- **`log_phase_status_change()`** : Changement de statut de phase
- **`log_document_upload()`** : Upload de document
- **`log_risk_identification()`** : Identification de risque
- **`log_user_login()`** : Connexion utilisateur
- **`log_user_logout()`** : Déconnexion utilisateur
- **`log_project_export()`** : Export de projet

### **Frontend (React)**

#### **Service auditService**
- **`getAuditTrail()`** : Liste des audits avec filtres
- **`getProjectHistory()`** : Historique complet d'un projet
- **`getUserActivity()`** : Activité d'un utilisateur
- **`getSystemOverview()`** : Vue d'ensemble du système (admin)
- **`exportAuditData()`** : Export des données d'audit

#### **Composant AuditPanel**
- **Onglets multiples** : Vue d'ensemble, historique projet, activité utilisateur, système
- **Filtres avancés** : Par action, ressource, utilisateur, projet, dates
- **Statistiques visuelles** : Graphiques et métriques
- **Export des données** : Rapports d'audit

## 🚀 **Utilisation**

### **1. Accès à la Traçabilité**

1. **Connectez-vous** à BuildFlow
2. **Allez dans l'onglet "Audit"** du tableau de bord
3. **Choisissez l'onglet** approprié selon vos besoins

### **2. Onglets Disponibles**

#### **📊 Vue d'ensemble**
- **Statistiques du projet** : Actions totales, actions récentes, utilisateurs actifs
- **Actions par type** : Répartition des actions (CREATE, UPDATE, DELETE, etc.)
- **Actions récentes** : Liste des 10 dernières actions avec détails

#### **📅 Historique projet**
- **Historique par type de ressource** : Groupement des actions par type (Projet, Phase, Document, etc.)
- **Détails des modifications** : Comparaison avant/après pour chaque changement
- **Chronologie complète** : Toutes les actions dans l'ordre chronologique

#### **👤 Activité utilisateur**
- **Statistiques personnelles** : Actions aujourd'hui, cette semaine, ce mois, total
- **Projets actifs** : Liste des projets sur lesquels l'utilisateur a travaillé
- **Activité récente** : Dernières 50 actions de l'utilisateur

#### **⚙️ Système (Admin seulement)**
- **Statistiques globales** : Vue d'ensemble de tout le système
- **Actions par type** : Répartition globale des actions
- **Utilisateurs les plus actifs** : Top 10 des utilisateurs par activité

### **3. Filtres et Recherche**

#### **Filtres Disponibles**
- **Action** : CREATE, UPDATE, DELETE, LOGIN, LOGOUT, UPLOAD, DOWNLOAD, etc.
- **Type de ressource** : Projet, Phase, Document, Risque, etc.
- **Utilisateur** : Filtrer par utilisateur spécifique
- **Projet** : Filtrer par projet spécifique
- **Dates** : Période de début et de fin
- **Recherche textuelle** : Dans les descriptions et noms de ressources

#### **Tri et Pagination**
- **Tri** : Par timestamp, action, ressource, utilisateur
- **Pagination** : Configurable (10, 25, 50, 100 par page)

### **4. Export des Données**

#### **Export d'Audit (Admin)**
1. **Allez dans l'onglet "Système"**
2. **Appliquez les filtres** souhaités
3. **Cliquez sur "Exporter"**
4. **Choisissez le format** (JSON, CSV)

#### **Export d'Historique Projet**
1. **Allez dans l'onglet "Historique projet"**
2. **Sélectionnez le projet** souhaité
3. **Utilisez les données** affichées pour vos rapports

## 🔧 **Configuration et Personnalisation**

### **Enregistrement Automatique**

Le système enregistre automatiquement les actions via le service `AuditService`. Pour l'utiliser dans vos vues :

```python
from projects.services import AuditService

# Dans une vue de création de projet
def create_project(request):
    projet = Projet.objects.create(...)
    
    # Enregistrer l'action
    AuditService.log_project_creation(projet, request.user, request)
    
    return Response(...)

# Dans une vue de modification
def update_project(request, pk):
    projet = Projet.objects.get(pk=pk)
    data_before = model_to_dict(projet)
    
    # Modifier le projet
    projet.save()
    
    data_after = model_to_dict(projet)
    
    # Enregistrer la modification
    AuditService.log_project_update(projet, request.user, data_before, data_after, request)
    
    return Response(...)
```

### **Actions Personnalisées**

Pour ajouter de nouvelles actions personnalisées :

```python
# Dans models.py
class AuditTrail(models.Model):
    ACTION_CHOICES = (
        # ... actions existantes ...
        ('CUSTOM_ACTION', 'Action personnalisée'),
    )

# Dans services.py
class AuditService:
    @staticmethod
    def log_custom_action(resource, user, description, request=None):
        return AuditService.log_action(
            action='CUSTOM_ACTION',
            user=user,
            resource=resource,
            description=description,
            request=request,
            context={'type': 'custom_action'}
        )
```

## 📊 **Métriques et KPIs**

### **Métriques Projet**
- **Nombre d'actions** par projet
- **Fréquence des modifications** par période
- **Utilisateurs les plus actifs** sur le projet
- **Types d'actions** les plus courants

### **Métriques Utilisateur**
- **Activité quotidienne** et hebdomadaire
- **Projets sur lesquels** l'utilisateur travaille
- **Types d'actions** effectuées
- **Tendances d'activité** dans le temps

### **Métriques Système**
- **Volume global** d'actions
- **Utilisateurs actifs** par période
- **Projets actifs** par période
- **Performance** du système d'audit

## 🔒 **Sécurité et Permissions**

### **Permissions par Défaut**
- **Utilisateurs normaux** : Accès à leurs propres actions et projets
- **Chefs de projet** : Accès à toutes les actions de leurs projets
- **Administrateurs** : Accès complet à toutes les données

### **Données Sensibles**
- **Adresses IP** : Enregistrées pour la sécurité
- **User-Agent** : Informations sur le navigateur
- **Session ID** : Identifiant de session
- **Contexte** : Métadonnées supplémentaires

### **Conformité RGPD**
- **Droit à l'oubli** : Suppression des données utilisateur
- **Portabilité** : Export des données personnelles
- **Transparence** : Accès aux données collectées

## 🚨 **Dépannage**

### **Problèmes Courants**

#### **Aucune donnée d'audit**
- **Vérifiez** que le service d'audit est activé
- **Vérifiez** les permissions de l'utilisateur
- **Vérifiez** que des actions ont été effectuées

#### **Erreurs d'API**
- **Vérifiez** l'authentification JWT
- **Vérifiez** les permissions de l'utilisateur
- **Vérifiez** les logs Django

#### **Performance lente**
- **Vérifiez** les index de la base de données
- **Limitez** le nombre de résultats
- **Utilisez** la pagination

### **Logs et Debugging**

```python
# Activer les logs d'audit
import logging
logger = logging.getLogger('audit')

# Dans vos vues
try:
    audit = AuditService.log_action(...)
    logger.info(f"Action enregistrée : {audit}")
except Exception as e:
    logger.error(f"Erreur d'audit : {e}")
```

## 📈 **Évolutions Futures**

### **Fonctionnalités Prévues**
- **Alertes en temps réel** pour actions critiques
- **Rapports automatisés** par email
- **Intégration SIEM** pour la sécurité
- **Machine Learning** pour détecter les anomalies
- **API GraphQL** pour requêtes complexes

### **Améliorations Techniques**
- **Cache Redis** pour les performances
- **Archivage automatique** des anciens audits
- **Compression** des données JSON
- **Indexation avancée** pour la recherche

## 📞 **Support**

Pour toute question ou problème avec la fonctionnalité de traçabilité :

1. **Consultez** ce guide
2. **Vérifiez** les logs Django
3. **Testez** avec l'API directement
4. **Contactez** l'équipe technique

---

**BuildFlow** - Traçabilité complète et transparente 🕵️‍♂️

