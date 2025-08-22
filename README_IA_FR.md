# Documentation IA BuildFlow - Français

## Vue d'ensemble
Ce projet ajoute un moteur d'analyse IA pour le suivi de chantier dans BuildFlow, avec prédiction de retards et dépassements budgétaires.

## Architecture

### 1. Backend IA (Django)
- **Emplacement**: `/ml/`
- **Composants**:
  - `train_model.py`: Script d'entraînement avec RandomForest
  - `inference.py`: Fonctions de prédiction
  - `enhanced_dataset.py`: Génération de dataset amélioré
  - `train_enhanced_model.py`: Modèles avancés

### 2. API REST
- **Endpoints**:
  - `GET /analytics/predict/delay/` - Prédiction de retard
  - `GET /analytics/predict/budget_overrun/` - Prédiction de dépassement
  - `GET /analytics/recommendations/` - Recommandations IA

### 3. Frontend React
- **Composants**:
  - `PredictionsPanel.tsx`: Panneau principal des prédictions
  - `RecommendationsList.tsx`: Liste des recommandations

## Installation et Configuration

### Prérequis
```bash
pip install -r requirements.txt
```

### Entraînement du modèle
```bash
# Méthode 1: Modèle de base
python ml/train_model.py

# Méthode 2: Modèle amélioré
python ml/train_enhanced_model.py
```

### Lancement local
```bash
# Backend Django
python manage.py runserver

# Frontend React
cd frontendbuild/project
npm install
npm run dev
```

## Utilisation

### API Endpoints

#### Prédiction de retard
```http
GET /analytics/predict/delay/?projet=1
```
**Réponse**:
```json
{
  "project_id": 1,
  "delay_probability": 45.2,
  "budget_overrun_estimate": 32.1,
  "recommendations": [
    "Accélérer les phases critiques...",
    "Réviser le plan d'achats..."
  ]
}
```

#### Recommandations
```http
GET /analytics/recommendations/?projet=1
```
**Réponse**:
```json
{
  "project_id": 1,
  "recommendations": [
    "Mettre en place un gel des dépenses...",
    "Revoir le registre des risques..."
  ]
}
```

### Interface utilisateur

#### Panneau de prédictions
- Affichage des probabilités en temps réel
- Barres de progression visuelles
- Bouton de rafraîchissement
- Gestion des états de chargement

#### Liste des recommandations
- Cartes colorées par priorité
- Icônes visuelles
- Étiquettes de priorité
- Design responsive

## Structure des données

### Features utilisées
- `progress_percent`: Pourcentage d'avancement
- `budget_spent`: Budget consommé (%)
- `weather`: Conditions météo (0-2)
- `incidents`: Nombre d'incidents
- `team_size`: Taille de l'équipe
- `team_experience`: Expérience moyenne
- `permit_delays`: Retards administratifs
- `supply_chain_issues`: Problèmes logistiques

### Modèles IA
- **RandomForestRegressor**: Prédiction de valeurs continues
- **Métriques**: MAE, R² pour l'évaluation
- **Re-entraînement**: Automatique avec nouvelles données

## Améliorations futures
- Intégration données météo réelles
- Modèles TensorFlow/Keras
- Apprentissage continu
- Dashboard analytique avancé

## Support
Pour toute question ou problème, consultez:
- Logs Django: `python manage.py runserver`
- Console navigateur (F12)
- Documentation API: `/api/docs/`
