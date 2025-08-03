# BuildFlow Frontend

Application frontend React/TypeScript pour la gestion de projets de construction.

## Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn
- Backend Django BuildFlow en cours d'exécution sur `http://localhost:8000`

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Démarrer le serveur de développement :
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Configuration

### Variables d'environnement

L'application utilise automatiquement la configuration appropriée selon l'environnement :

- **Développement** : `http://localhost:8000/api`
- **Production** : Configuré via les variables d'environnement

### Connexion Backend

L'application se connecte automatiquement au backend Django sur :
- URL de base : `http://localhost:8000/api`
- Authentification : JWT Token
- CORS : Configuré pour `localhost:3000` et `localhost:5173`

## Fonctionnalités

### Espace Public
- Affichage des projets publics
- Statistiques de transparence
- Carte interactive des projets
- FAQ et contact

### Espace Privé (Authentifié)
- Tableau de bord personnel
- Gestion des projets
- Alertes et notifications
- Recommandations IA
- Gestion des phases et actions

## Structure du Projet

```
src/
├── components/          # Composants React
│   ├── PublicHome.tsx  # Page d'accueil publique
│   └── PrivateDashboard.tsx # Dashboard privé
├── contexts/           # Contextes React
│   └── AuthContext.tsx # Gestion de l'authentification
├── services/           # Services API
│   ├── api.ts         # Configuration axios
│   ├── authService.ts # Service d'authentification
│   └── projectService.ts # Service des projets
└── config/            # Configuration
    └── environment.ts # Variables d'environnement
```

## API Endpoints

L'application utilise les endpoints suivants du backend Django :

### Authentification
- `POST /api/token/` - Connexion
- `POST /api/token/refresh/` - Rafraîchissement du token
- `POST /api/token/verify/` - Vérification du token

### Projets
- `GET /api/projets/` - Liste des projets
- `POST /api/projets/` - Créer un projet
- `GET /api/projets/{id}/` - Détails d'un projet
- `PUT /api/projets/{id}/` - Modifier un projet
- `DELETE /api/projets/{id}/` - Supprimer un projet

### Utilisateurs
- `GET /api/users/profils/` - Profil utilisateur

## Développement

### Mode Développement
En mode développement, l'application :
- Se connecte au backend sur `localhost:8000`
- Utilise des données mockées si le backend n'est pas disponible
- Affiche des logs détaillés dans la console

### Hot Reload
L'application supporte le hot reload pour un développement rapide.

## Build de Production

```bash
npm run build
```

Le build de production sera généré dans le dossier `dist/`.

## Déploiement

1. Construire l'application :
```bash
npm run build
```

2. Servir les fichiers statiques depuis le dossier `dist/`

3. Configurer les variables d'environnement pour la production :
   - `REACT_APP_API_BASE_URL`
   - `REACT_APP_FRONTEND_URL`

## Support

Pour toute question ou problème, consultez la documentation du backend Django ou contactez l'équipe de développement. 