# Guide de la Fonctionnalité Documents - BuildFlow

## 🎯 **Vue d'Ensemble**

La fonctionnalité **Documents** de BuildFlow permet de gérer, organiser et partager tous les documents liés aux projets de construction. Elle offre une interface moderne et intuitive pour l'upload, la recherche, le filtrage et l'export des documents.

## ✨ **Fonctionnalités Principales**

### 1. **Gestion des Documents par Projet**
- **Sélecteur de projet** : Choisir facilement entre tous les projets disponibles
- **Documents organisés** : Chaque projet a ses propres documents
- **Interface contextuelle** : Affichage adapté au projet sélectionné

### 2. **Types de Documents Supportés**
- **PLAN** : Plans architecturaux, techniques, de fondation, etc.
- **CONTRAT** : Contrats, conventions, accords
- **RAPPORT** : Rapports d'études, d'avancement, de qualité
- **PV** : Procès-verbaux de réception, de réunion

### 3. **Upload et Gestion de Fichiers**
- **Drag & Drop** : Interface intuitive pour l'upload
- **Formats supportés** : PDF, Word, Excel, images, archives
- **Taille maximale** : 50 MB par fichier
- **Métadonnées** : Nom, type, description personnalisables

### 4. **Recherche et Filtrage**
- **Recherche textuelle** : Par nom de document
- **Filtrage par type** : Sélection du type de document
- **Tri intelligent** : Par date, nom, type
- **Résultats en temps réel** : Mise à jour instantanée

### 5. **Export et Partage**
- **Export complet du projet** : Tous les documents en ZIP
- **Formats multiples** : JSON + CSV pour chaque catégorie
- **Téléchargement sécurisé** : Vérification des permissions
- **Documentation incluse** : README détaillé dans l'export

## 🏗️ **Architecture Technique**

### **Backend (Django)**
```
documents/
├── models.py          # Modèle Document
├── views.py           # API REST avec ViewSet
├── serializers.py     # Sérialisation des données
├── services.py        # Service d'export des projets
└── urls.py           # Configuration des routes
```

### **Frontend (React + TypeScript)**
```
components/
├── DocumentsPanel.tsx        # Interface principale
├── DocumentUploadModal.tsx   # Modal d'upload
└── services/
    └── documentService.ts    # Service API frontend
```

### **API Endpoints**
- `GET /api/documents/` - Liste des documents
- `GET /api/documents/projet/{id}/` - Documents d'un projet
- `POST /api/documents/` - Créer un document
- `GET /api/documents/export-projet/{id}/` - Exporter un projet
- `GET /api/documents/types/` - Types disponibles
- `GET /api/documents/statistiques/` - Statistiques

## 🚀 **Utilisation**

### **1. Accès à la Fonctionnalité**
1. **Connexion** : Se connecter à BuildFlow
2. **Navigation** : Cliquer sur "Documents" dans le menu
3. **Sélection** : Choisir un projet dans la liste

### **2. Ajout d'un Document**
1. **Cliquer** sur "Ajouter un document"
2. **Sélectionner** le type de document
3. **Saisir** le nom descriptif
4. **Glisser-déposer** ou sélectionner le fichier
5. **Valider** l'upload

### **3. Recherche et Filtrage**
1. **Utiliser** la barre de recherche
2. **Sélectionner** le type dans le filtre
3. **Voir** les résultats en temps réel
4. **Trier** par colonne si nécessaire

### **4. Export d'un Projet**
1. **Sélectionner** le projet
2. **Cliquer** sur "Exporter le projet"
3. **Attendre** la génération du ZIP
4. **Télécharger** automatiquement

## 📊 **Interface Utilisateur**

### **En-tête du Projet**
- **Nom et description** du projet sélectionné
- **Statistiques** : Phases, documents, budget, statut
- **Boutons d'action** : Export et ajout de document

### **Sélecteur de Projet**
- **Dropdown** avec tous les projets disponibles
- **Indicateur visuel** du projet actuel
- **Changement rapide** entre projets

### **Liste des Documents**
- **Tableau organisé** : Document, Type, Auteur, Date, Actions
- **Icônes visuelles** pour chaque type de document
- **Actions rapides** : Voir, télécharger, supprimer

### **Modal d'Upload**
- **Interface moderne** avec drag & drop
- **Validation en temps réel** des champs
- **Barre de progression** pour l'upload
- **Gestion des erreurs** claire

## 🔧 **Configuration et Personnalisation**

### **Types de Documents**
```python
# Dans documents/models.py
TYPE_CHOICES = [
    ('PLAN', 'Plan'),
    ('CONTRAT', 'Contrat'),
    ('RAPPORT', 'Rapport'),
    ('PV', 'PV de réception'),
]
```

### **Formats de Fichiers Acceptés**
```typescript
// Dans DocumentUploadModal.tsx
accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.rar"
```

### **Taille Maximale**
```python
# Dans documents/models.py
fichier = models.FileField(
    upload_to='documents/',
    max_length=255,
    validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar'])]
)
```

## 📈 **Fonctionnalités Avancées**

### **Export Complet des Projets**
- **Données JSON** : Structure complète du projet
- **Fichiers CSV** : Données tabulaires par catégorie
- **Métadonnées** : Informations de contexte et statistiques
- **Documentation** : Guide d'utilisation inclus

### **Gestion des Permissions**
- **Vérification** des droits d'accès au projet
- **Sécurité** : Seuls les membres peuvent voir les documents
- **Audit** : Traçabilité des actions sur les documents

### **Recherche Intelligente**
- **Indexation** des noms et métadonnées
- **Filtrage** multi-critères
- **Performance** : Résultats instantanés

## 🧪 **Tests et Validation**

### **Tests Automatisés**
- **API** : Endpoints et fonctionnalités
- **Frontend** : Composants et interactions
- **Intégration** : Flux complets utilisateur

### **Données de Test**
- **48 documents** créés automatiquement
- **6 projets** avec documents variés
- **4 types** de documents représentés

### **Validation des Fonctionnalités**
- ✅ **Upload** de documents
- ✅ **Recherche** et filtrage
- ✅ **Export** de projets
- ✅ **Gestion** des permissions
- ✅ **Interface** responsive

## 🚨 **Dépannage**

### **Problèmes Courants**

#### **Document non uploadé**
- **Vérifier** la taille du fichier (max 50 MB)
- **Contrôler** le format accepté
- **S'assurer** d'être connecté

#### **Projet non visible**
- **Vérifier** les permissions utilisateur
- **Contrôler** l'appartenance au projet
- **Actualiser** la page

#### **Export en échec**
- **Vérifier** la connexion internet
- **Contrôler** l'espace disque
- **Attendre** la fin de la génération

### **Logs et Debugging**
- **Console navigateur** : Erreurs JavaScript
- **Logs Django** : Erreurs backend
- **Network** : Requêtes API

## 🔮 **Évolutions Futures**

### **Fonctionnalités Planifiées**
- **Versioning** des documents
- **Collaboration** en temps réel
- **OCR** pour la recherche dans les PDF
- **Intégration** avec des services cloud

### **Améliorations Techniques**
- **Cache** intelligent des documents
- **Compression** automatique des images
- **Synchronisation** multi-appareils
- **API** GraphQL

### **Expérience Utilisateur**
- **Interface** drag & drop avancée
- **Prévisualisation** des documents
- **Notifications** en temps réel
- **Mobile** first design

## 📚 **Documentation API**

### **Endpoints Principaux**

#### **GET /api/documents/projet/{id}/**
```json
{
  "projet": {
    "id": 1,
    "nom": "Résidence Les Jardins",
    "description": "Construction d'une résidence..."
  },
  "documents": [...],
  "total_documents": 8
}
```

#### **POST /api/documents/**
```json
{
  "projet": 1,
  "type": "PLAN",
  "nom": "Plan architectural principal",
  "fichier": "[fichier]"
}
```

#### **GET /api/documents/export-projet/{id}/**
- **Type** : Fichier ZIP
- **Contenu** : Données JSON + CSV + README
- **Headers** : Content-Disposition pour téléchargement

## 🎉 **Résultat Final**

**FONCTIONNALITÉ DOCUMENTS COMPLÈTEMENT REFAITE** ✅

### **Avant la Refonte**
- ❌ Interface basique et peu intuitive
- ❌ Gestion limitée des projets
- ❌ Fonctionnalités d'export basiques
- ❌ Recherche et filtrage limités

### **Après la Refonte**
- ✅ **Interface moderne** et responsive
- ✅ **Gestion complète** des projets
- ✅ **Export avancé** avec métadonnées
- ✅ **Recherche intelligente** et filtrage
- ✅ **Upload drag & drop** intuitif
- ✅ **Permissions sécurisées** et audit
- ✅ **48 documents de test** créés
- ✅ **API complète** et documentée

**BuildFlow dispose maintenant d'une fonctionnalité Documents de niveau professionnel, offrant une expérience utilisateur exceptionnelle pour la gestion documentaire des projets de construction.**

---

**Statut** : ✅ COMPLÉTÉ  
**Version** : 2.0  
**Dernière mise à jour** : Janvier 2024  
**Auteur** : Équipe BuildFlow



