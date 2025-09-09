# Guide : Responsable par Phase

## Vue d'ensemble

Cette fonctionnalité permet d'assigner un responsable spécifique à chaque phase d'un projet. Chaque phase peut avoir son propre responsable, différent du chef de projet global.

## Fonctionnalités ajoutées

### 1. Modèle de données
- **Champ `responsable`** ajouté au modèle `Phase`
- **Champ `responsable_telephone`** ajouté au modèle `Phase`
- Champ de texte libre pour saisir le nom du responsable
- Champ de texte pour saisir le numéro de téléphone (ex: +221 77 123 45 67)
- Champs optionnels (peuvent être vides)

### 2. Interface utilisateur
- **Champ de saisie libre** pour le nom du responsable dans le modal de création/modification de phase
- **Champ de saisie** pour le numéro de téléphone du responsable
- **Affichage du responsable** dans la liste des phases avec numéro de téléphone
- **Colonne dédiée** dans le tableau des phases

### 3. API
- **Sérialiseur mis à jour** pour inclure les champs responsable
- **Champs** : `responsable` et `responsable_telephone` (chaînes de caractères)

## Utilisation

### Création d'une nouvelle phase
1. Cliquer sur "Créer une phase"
2. Remplir les informations de base (nom, description, dates)
3. **Saisir le nom du responsable** dans le champ texte
4. **Saisir le numéro de téléphone** du responsable (optionnel)
5. Sauvegarder la phase

### Modification d'une phase existante
1. Cliquer sur l'icône d'édition de la phase
2. Modifier le responsable si nécessaire
3. Sauvegarder les modifications

### Affichage des phases
- Chaque phase affiche clairement son responsable
- Le numéro de téléphone est affiché sous le nom (si renseigné)
- Icônes utilisateur et téléphone pour une meilleure lisibilité
- Indication "Aucun responsable" si non assigné

## Avantages

1. **Responsabilité claire** : Chaque phase a un responsable identifié
2. **Suivi amélioré** : Facilite la gestion et le suivi des tâches
3. **Communication** : Les responsables peuvent être notifiés des mises à jour
4. **Flexibilité** : Différents responsables pour différentes phases

## Structure technique

### Modèle Phase (Django)
```python
class Phase(models.Model):
    # ... autres champs ...
    responsable = models.CharField(
        max_length=255, 
        blank=True, 
        help_text="Nom de la personne responsable de cette phase"
    )
    responsable_telephone = models.CharField(
        max_length=20, 
        blank=True, 
        help_text="Numéro de téléphone du responsable (ex: +221 77 123 45 67)"
    )
```

### Interface TypeScript
```typescript
export interface Phase {
  // ... autres champs ...
  responsable?: string;
  responsable_telephone?: string;
}
```

### Sérialiseur Django
```python
class PhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Phase
        fields = '__all__'
```

## Migration de base de données

- Migration `0008_phase_responsable` : Ajout du champ `responsable` (ForeignKey puis CharField)
- Migration `0009_alter_phase_responsable` : Modification du type de champ `responsable`
- Migration `0010_phase_responsable_telephone` : Ajout du champ `responsable_telephone`

## Évolutions futures possibles

1. **Notifications automatiques** : Envoyer des emails aux responsables lors des changements
2. **Tableau de bord responsable** : Vue dédiée pour chaque responsable
3. **Historique des responsabilités** : Traçabilité des changements de responsable
4. **Permissions par phase** : Contrôle d'accès basé sur le rôle de responsable

## Tests

Pour tester la fonctionnalité :
1. Créer un nouveau projet
2. Ajouter plusieurs phases avec différents responsables
3. Vérifier l'affichage dans la liste des phases
4. Modifier les responsables et vérifier la persistance

## Support

En cas de problème ou question sur cette fonctionnalité, consulter :
- Les logs Django pour les erreurs backend
- La console du navigateur pour les erreurs frontend
- La documentation des modèles et API
