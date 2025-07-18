# 🏗️ BuildFlow - Gestion de Projets de Construction

## 📋 Description

BuildFlow est une application web Django complète pour la gestion de projets de construction. Elle permet de gérer les projets, phases, budgets, risques, actions et documents avec une API REST moderne et une interface d'administration complète.

## ✨ Fonctionnalités Principales

### 🎯 Gestion de Projets
- **Création et gestion** de projets de construction
- **Phases de projet** avec ordre et statuts
- **Suivi budgétaire** (prévu, réel, ajustements)
- **Gestion des risques** avec niveaux et probabilités
- **Actions et tâches** avec priorités et responsables
- **Commentaires** et notifications en temps réel

### 📁 Gestion de Documents
- **Upload et stockage** de documents par projet
- **Types de documents** : Plans, Contrats, Rapports, PV de réception
- **Stockage cloud** avec AWS S3
- **Organisation** par date et projet

### 👥 Gestion des Utilisateurs
- **Profils utilisateurs** avec rôles (Gestionnaire, Administrateur, Consultant)
- **Authentification JWT** sécurisée
- **Permissions** granulaires par projet

### 📊 Analytics et Rapports
- **Statistiques** de projets en temps réel
- **Suivi des risques** et alertes
- **Rapports** de progression
- **Métriques** de performance

## 🛠️ Technologies Utilisées

### Backend
- **Django 4.2.7** - Framework web Python
- **Django REST Framework 3.14.0** - API REST
- **Django REST Framework SimpleJWT 5.3.0** - Authentification JWT
- **MySQL** - Base de données principale
- **Django CORS Headers 4.1.0** - Gestion CORS
- **Django Filter 23.3** - Filtrage avancé

### Stockage et Services
- **AWS S3** - Stockage de fichiers cloud
- **Boto3** - SDK AWS pour Python
- **MySQL Client** - Connecteur MySQL

### Développement et Déploiement
- **Gunicorn 20.1.0** - Serveur WSGI
- **Python Decouple 3.8** - Gestion des variables d'environnement

## 🗄️ Structure de la Base de Données

### Modèles Principaux

#### Projet
```python
- nom: CharField
- description: TextField
- date_debut: DateField
- date_fin_prevue: DateField
- date_fin_reelle: DateField
- statut: CharField (En cours, Terminé, En attente, Annulé)
- budget_prevue: DecimalField
- budget_reel: DecimalField
- chef_projet: ForeignKey(User)
- membres: ManyToManyField(User)
```

#### Phase
```python
- projet: ForeignKey(Projet)
- nom: CharField
- description: TextField
- date_debut: DateField
- date_fin_prevue: DateField
- date_fin_reelle: DateField
- statut: CharField
- ordre: IntegerField
```

#### Budget
```python
- projet: ForeignKey(Projet)
- type: CharField (Prévu, Réel, Ajustement)
- montant: DecimalField
- description: TextField
- date: DateField
```

#### Risque
```python
- projet: ForeignKey(Projet)
- nom: CharField
- description: TextField
- niveau: CharField (Faible, Moyen, Élevé, Critique)
- probabilite: IntegerField
- impact: TextField
- mesures_mitigation: TextField
- responsable: ForeignKey(User)
```

#### Action
```python
- projet: ForeignKey(Projet)
- phase: ForeignKey(Phase)
- titre: CharField
- description: TextField
- statut: CharField
- responsable: ForeignKey(User)
- priorite: IntegerField
- date_debut: DateField
- date_fin_prevue: DateField
- date_fin_reelle: DateField
```

#### Document
```python
- projet: ForeignKey(Projet)
- type: CharField (Plan, Contrat, Rapport, PV)
- nom: CharField
- fichier: FileField
- date_upload: DateTimeField
- auteur: ForeignKey(User)
```

## 🔧 Configuration

### Prérequis
- Python 3.8+
- MySQL 8.0+
- Compte AWS (pour S3)

### Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd buildflow
```

2. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

3. **Configurer la base de données MySQL**
```sql
CREATE DATABASE buildflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. **Configurer les variables d'environnement**
Créer un fichier `.env` à la racine du projet :
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=your_bucket_name
AWS_S3_REGION_NAME=us-east-1
```

5. **Appliquer les migrations**
```bash
cd buildflow
python manage.py makemigrations
python manage.py migrate
```

6. **Créer un superutilisateur**
```bash
python manage.py createsuperuser
```

7. **Démarrer le serveur**
```bash
python manage.py runserver
```

## 🌐 API REST

### Authentification
- **Endpoint** : `POST /api/token/`
- **Body** : `{"username": "user", "password": "pass"}`
- **Response** : `{"access": "token", "refresh": "token"}`

### Endpoints Principaux

#### Projets
- `GET /api/projets/` - Liste des projets
- `POST /api/projets/` - Créer un projet
- `GET /api/projets/{id}/` - Détails d'un projet
- `PUT /api/projets/{id}/` - Modifier un projet
- `DELETE /api/projets/{id}/` - Supprimer un projet
- `GET /api/projets/{id}/statistiques/` - Statistiques du projet
- `GET /api/projets/{id}/phases/` - Phases du projet
- `GET /api/projets/{id}/actions/` - Actions du projet

#### Phases
- `GET /api/phases/` - Liste des phases
- `POST /api/phases/` - Créer une phase
- `GET /api/phases/{id}/` - Détails d'une phase
- `PUT /api/phases/{id}/` - Modifier une phase
- `DELETE /api/phases/{id}/` - Supprimer une phase

#### Budgets
- `GET /api/budgets/` - Liste des budgets
- `POST /api/budgets/` - Créer un budget
- `GET /api/budgets/{id}/` - Détails d'un budget
- `PUT /api/budgets/{id}/` - Modifier un budget
- `DELETE /api/budgets/{id}/` - Supprimer un budget

#### Risques
- `GET /api/risques/` - Liste des risques
- `POST /api/risques/` - Créer un risque
- `GET /api/risques/{id}/` - Détails d'un risque
- `PUT /api/risques/{id}/` - Modifier un risque
- `DELETE /api/risques/{id}/` - Supprimer un risque

#### Actions
- `GET /api/actions/` - Liste des actions
- `GET /api/actions/{id}/` - Détails d'une action

#### Notifications
- `GET /api/notifications/` - Notifications de l'utilisateur
- `PUT /api/notifications/{id}/` - Marquer comme lu

#### Commentaires
- `GET /api/commentaires/` - Liste des commentaires
- `POST /api/commentaires/` - Créer un commentaire
- `GET /api/commentaires/{id}/` - Détails d'un commentaire
- `PUT /api/commentaires/{id}/` - Modifier un commentaire
- `DELETE /api/commentaires/{id}/` - Supprimer un commentaire

### Filtrage et Recherche
Tous les endpoints supportent :
- **Filtrage** : `?statut=EN_COURS&chef_projet=1`
- **Recherche** : `?search=nom_projet`
- **Tri** : `?ordering=-date_creation`
- **Pagination** : `?page=1&page_size=10`

## 🔐 Sécurité

### Authentification
- **JWT Tokens** avec expiration automatique
- **Refresh tokens** pour renouvellement
- **Permissions** granulaires par utilisateur

### CORS
- **Origines autorisées** : localhost:3000, localhost:8000
- **Credentials** autorisés pour l'authentification

### Base de Données
- **MySQL** avec charset utf8mb4
- **Mode strict** activé
- **Connexions sécurisées**

## 📁 Structure du Projet

```
buildflow/
├── buildflow/                 # Configuration principale
│   ├── settings.py           # Configuration Django
│   ├── urls.py               # URLs principales
│   └── wsgi.py               # Configuration WSGI
├── projects/                 # Application projets
│   ├── models.py             # Modèles de données
│   ├── views.py              # Vues API
│   ├── serializers.py        # Serializers API
│   ├── admin.py              # Interface d'administration
│   └── urls.py               # URLs de l'application
├── users/                    # Application utilisateurs
├── documents/                # Application documents
├── analytics/                # Application analytics
├── requirements.txt          # Dépendances Python
├── manage.py                 # Script de gestion Django
└── README.md                 # Documentation
```

## 🚀 Déploiement

### Production
1. **Configurer les variables d'environnement**
2. **Désactiver DEBUG**
3. **Configurer un serveur WSGI (Gunicorn)**
4. **Configurer un serveur web (Nginx)**
5. **Configurer SSL/TLS**

### Variables d'environnement de production
```env
DEBUG=False
SECRET_KEY=your-secure-production-key
ALLOWED_HOSTS=your-domain.com
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=your-bucket
```

## 📊 Fonctionnalités Avancées

### Notifications Automatiques
- **Création de projet** → Notification au chef de projet
- **Modification importante** → Notification aux membres
- **Nouveau commentaire** → Notification aux participants

### Statistiques en Temps Réel
- **Nombre de phases** par projet
- **Nombre d'actions** par projet
- **Nombre de risques** par projet
- **Progression** des phases

### Filtrage et Recherche Avancés
- **Recherche textuelle** dans les noms et descriptions
- **Filtrage par statut** et dates
- **Tri personnalisé** par tous les champs
- **Pagination** configurable

## 🤝 Contribution

1. **Fork** le projet
2. **Créer** une branche feature
3. **Commit** vos changements
4. **Push** vers la branche
5. **Créer** une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- **Issues** : Créer une issue sur GitHub
- **Email** : contact@buildflow.com
- **Documentation** : Voir la documentation technique

---

**BuildFlow** - Gestion intelligente de projets de construction 🏗️ 