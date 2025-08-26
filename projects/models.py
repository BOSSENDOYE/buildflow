from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
import json

class Projet(models.Model):
    STATUT_CHOICES = (
        ('EN_COURS', 'En cours'),
        ('TERMINE', 'Terminé'),
        ('EN_ATTENTE', 'En attente'),
        ('ANNULE', 'Annulé'),
    )
    
    # Choix pour les étapes/phase de construction
    ETAPE_CHOICES = (
        ('', '---------'),
        ('PREPARATION', 'Préparation du terrain'),
        ('FONDATIONS', 'Fondations'),
        ('GROS_OEUVRE', 'Gros œuvre'),
        ('SECOND_OEUVRE', 'Second œuvre'),
        ('FINITIONS', 'Finitions'),
        ('AMENAGEMENT', 'Aménagement extérieur'),
        ('RECEPTION', 'Réception des travaux'),
    )
    
    # Choix pour les régions du Sénégal
    REGION_CHOICES = (
        ('', '---------'),
        ('DAKAR', 'Dakar'),
        ('THIES', 'Thiès'),
        ('DIOURBEL', 'Diourbel'),
        ('FATICK', 'Fatick'),
        ('KAOLACK', 'Kaolack'),
        ('KOLDA', 'Kolda'),
        ('LOUGA', 'Louga'),
        ('MATAM', 'Matam'),
        ('SAINT_LOUIS', 'Saint-Louis'),
        ('SEDHIOU', 'Sédhiou'),
        ('TAMBACOUNDA', 'Tambacounda'),
        ('ZIGUINCHOR', 'Ziguinchor'),
        ('KAFFRINE', 'Kaffrine'),
        ('KEDOUGOU', 'Kédougou'),
    )
    
    # Choix pour les départements du Sénégal
    DEPARTEMENT_CHOICES = (
        ('', '---------'),
        # Dakar
        ('DAKAR', 'Dakar'),
        ('GUEDIAWAYE', 'Guédiawaye'),
        ('PIKINE', 'Pikine'),
        ('RUFISQUE', 'Rufisque'),
        # Thiès
        ('THIES', 'Thiès'),
        ('MBOUR', 'M\'bour'),
        ('TIVAOUANE', 'Tivaouane'),
        # Diourbel
        ('DIOURBEL', 'Diourbel'),
        ('BAMBEY', 'Bambey'),
        ('MBACKE', 'Mbacké'),
        # Fatick
        ('FATICK', 'Fatick'),
        ('FOUNDIOUGNE', 'Foundiougne'),
        ('GOSSAS', 'Gossas'),
        # Kaolack
        ('KAOLACK', 'Kaolack'),
        ('GUINGUINEO', 'Guinguinéo'),
        ('NIORO', 'Nioro du Rip'),
        # Kolda
        ('KOLDA', 'Kolda'),
        ('MEDINA_YORO_FOULA', 'Médina Yoro Foulah'),
        ('VELINGARA', 'Vélingara'),
        # Louga
        ('LOUGA', 'Louga'),
        ('KEBEMER', 'Kébémer'),
        ('LINGUERE', 'Linguère'),
        # Matam
        ('MATAM', 'Matam'),
        ('KANEL', 'Kanel'),
        ('RANEROU', 'Ranérou'),
        # Saint-Louis
        ('SAINT_LOUIS', 'Saint-Louis'),
        ('DAGANA', 'Dagana'),
        ('PODOR', 'Podor'),
        # Sédhiou
        ('SEDHIOU', 'Sédhiou'),
        ('BOUNKILING', 'Bounkiling'),
        ('GOUDOMP', 'Goudomp'),
        # Tambacounda
        ('TAMBACOUNDA', 'Tambacounda'),
        ('BAKEL', 'Bakel'),
        ('GOUDIRY', 'Goudiry'),
        ('KOUMPENTOUM', 'Koumpentoum'),
        # Ziguinchor
        ('ZIGUINCHOR', 'Ziguinchor'),
        ('BIGNONA', 'Bignona'),
        ('OUSSOUYE', 'Oussouye'),
        # Kaffrine
        ('KAFFRINE', 'Kaffrine'),
        ('BIRKILANE', 'Birkilane'),
        ('MALEM_HODAR', 'Malem Hodar'),
        # Kédougou
        ('KEDOUGOU', 'Kédougou'),
        ('SALEMATA', 'Salémata'),
        ('SARAYA', 'Saraya'),
    )
    
    nom = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date_debut = models.DateField()
    date_fin_prevue = models.DateField()
    date_fin_reelle = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_COURS')
    budget_prevue = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    budget_reel = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    # Nouvelles informations demandées
    nom_entreprise = models.CharField(max_length=255, blank=True)
    region = models.CharField(max_length=20, choices=REGION_CHOICES, blank=True)
    departement = models.CharField(max_length=30, choices=DEPARTEMENT_CHOICES, blank=True)
    etape_actuelle = models.CharField(max_length=20, choices=ETAPE_CHOICES, blank=True)
    chef_projet = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='projets_diriges')
    membres = models.ManyToManyField(User, related_name='projets_participes', blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nom

    class Meta:
        verbose_name = "Projet"
        verbose_name_plural = "Projets"


class Risque(models.Model):
    NIVEAU_CHOICES = (
        ('FAIBLE', 'Faible'),
        ('MOYEN', 'Moyen'),
        ('ELEVE', 'Élevé'),
        ('CRITIQUE', 'Critique'),
    )
    
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='risques')
    nom = models.CharField(max_length=255)
    description = models.TextField()
    niveau = models.CharField(max_length=20, choices=NIVEAU_CHOICES)
    probabilite = models.IntegerField(help_text="Probabilité en pourcentage (0-100)")
    impact = models.TextField()
    mesures_mitigation = models.TextField(blank=True)
    date_identification = models.DateTimeField(auto_now_add=True)
    date_resolution = models.DateTimeField(null=True, blank=True)
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.projet.nom} - {self.nom}"

    class Meta:
        verbose_name = "Risque"
        verbose_name_plural = "Risques"


class Phase(models.Model):
    STATUT_CHOICES = (
        ('EN_COURS', 'En cours'),
        ('TERMINEE', 'Terminée'),
        ('EN_ATTENTE', 'En attente'),
    )
    
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='phases')
    nom = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date_debut = models.DateField()
    date_fin_prevue = models.DateField()
    date_fin_reelle = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    ordre = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.projet.nom} - {self.nom}"

    class Meta:
        verbose_name = "Phase"
        verbose_name_plural = "Phases"
        ordering = ['ordre']


class Budget(models.Model):
    TYPE_CHOICES = (
        ('PREVU', 'Prévu'),
        ('REEL', 'Réel'),
        ('AJUSTEMENT', 'Ajustement'),
    )
    
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='budgets')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    montant = models.DecimalField(max_digits=15, decimal_places=2)
    description = models.TextField(blank=True)
    date = models.DateField()
    
    def __str__(self):
        return f"{self.projet.nom} - {self.type}: {self.montant}"

    class Meta:
        verbose_name = "Budget"
        verbose_name_plural = "Budgets"


class Action(models.Model):
    STATUT_CHOICES = (
        ('A_FAIRE', 'À faire'),
        ('EN_COURS', 'En cours'),
        ('TERMINEE', 'Terminée'),
        ('ANNULEE', 'Annulée'),
    )
    
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='actions')
    phase = models.ForeignKey(Phase, on_delete=models.CASCADE, related_name='actions', null=True, blank=True)
    titre = models.CharField(max_length=255)
    description = models.TextField()
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='A_FAIRE')
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    date_debut = models.DateField(null=True, blank=True)
    date_fin_prevue = models.DateField(null=True, blank=True)
    date_fin_reelle = models.DateField(null=True, blank=True)
    priorite = models.IntegerField(default=1, help_text="1 = Très haute, 5 = Très basse")
    
    def __str__(self):
        return f"{self.projet.nom} - {self.titre}"

    class Meta:
        verbose_name = "Action"
        verbose_name_plural = "Actions"


class Notification(models.Model):
    TYPE_CHOICES = (
        ('INFO', 'Information'),
        ('WARNING', 'Avertissement'),
        ('ERROR', 'Erreur'),
        ('SUCCESS', 'Succès'),
    )
    
    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    titre = models.CharField(max_length=255)
    message = models.TextField()
    lu = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.utilisateur.username} - {self.titre}"

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-date_creation']


class Commentaire(models.Model):
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='commentaires')
    auteur = models.ForeignKey(User, on_delete=models.CASCADE)
    contenu = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.projet.nom} - {self.auteur.username}"

    class Meta:
        verbose_name = "Commentaire"
        verbose_name_plural = "Commentaires"
        ordering = ['-date_creation'] 


# --- Traçabilité / Journal d'audit ---
class AuditLog(models.Model):
    ACTION_CHOICES = (
        ('CREATE', 'CREATE'),
        ('UPDATE', 'UPDATE'),
        ('DELETE', 'DELETE'),
    )

    utilisateur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=100)
    resource_id = models.PositiveIntegerField()
    resource_repr = models.TextField()
    before = models.JSONField(null=True, blank=True)
    after = models.JSONField(null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Audit"
        verbose_name_plural = "Audits"
        ordering = ['-date_creation']

    def __str__(self):
        return f"{self.date_creation} {self.action} {self.resource_type}#{self.resource_id}"


class AuditTrail(models.Model):
    """Modèle pour tracer toutes les actions dans le système"""
    
    ACTION_CHOICES = (
        ('CREATE', 'Création'),
        ('UPDATE', 'Modification'),
        ('DELETE', 'Suppression'),
        ('LOGIN', 'Connexion'),
        ('LOGOUT', 'Déconnexion'),
        ('EXPORT', 'Export'),
        ('IMPORT', 'Import'),
        ('UPLOAD', 'Upload de fichier'),
        ('DOWNLOAD', 'Téléchargement'),
        ('STATUS_CHANGE', 'Changement de statut'),
        ('ASSIGNMENT', 'Attribution'),
        ('COMMENT', 'Commentaire'),
        ('NOTIFICATION', 'Notification'),
    )
    
    # Informations sur l'action
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Utilisateur qui a effectué l'action
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_actions')
    
    # Ressource concernée (générique pour supporter tous les modèles)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Informations sur la ressource
    resource_type = models.CharField(max_length=100)  # Nom du modèle (ex: 'Projet', 'Phase')
    resource_name = models.CharField(max_length=255)  # Nom de la ressource
    resource_id = models.PositiveIntegerField()
    
    # Projet associé (si applicable)
    projet = models.ForeignKey('Projet', on_delete=models.CASCADE, null=True, blank=True, related_name='audit_trails')
    
    # Détails de l'action
    description = models.TextField(blank=True)
    
    # Données avant/après (pour les modifications)
    data_before = models.JSONField(null=True, blank=True)
    data_after = models.JSONField(null=True, blank=True)
    
    # Métadonnées
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    session_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Contexte de l'action
    context = models.JSONField(null=True, blank=True)  # Informations supplémentaires
    
    class Meta:
        verbose_name = "Traçabilité"
        verbose_name_plural = "Traçabilités"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['timestamp']),
            models.Index(fields=['action']),
            models.Index(fields=['user']),
            models.Index(fields=['projet']),
            models.Index(fields=['resource_type']),
            models.Index(fields=['content_type', 'object_id']),
        ]
    
    def __str__(self):
        return f"{self.get_action_display()} - {self.resource_type} {self.resource_name} par {self.user.username if self.user else 'Système'}"
    
    def get_changes_summary(self):
        """Retourne un résumé des changements pour les modifications"""
        if self.action == 'UPDATE' and self.data_before and self.data_after:
            changes = []
            for key in set(self.data_before.keys()) | set(self.data_after.keys()):
                if self.data_before.get(key) != self.data_after.get(key):
                    changes.append({
                        'field': key,
                        'before': self.data_before.get(key),
                        'after': self.data_after.get(key)
                    })
            return changes
        return []
    
    def get_formatted_timestamp(self):
        """Retourne la date formatée en français"""
        return self.timestamp.strftime('%d/%m/%Y à %H:%M:%S')
    
    @classmethod
    def log_action(cls, action, user, resource, description='', data_before=None, data_after=None, 
                   projet=None, ip_address=None, user_agent=None, session_id=None, context=None):
        """Méthode utilitaire pour enregistrer une action"""
        try:
            # Déterminer le type de ressource
            if hasattr(resource, '_meta'):
                resource_type = resource._meta.verbose_name.title()
                resource_name = str(resource)
                resource_id = resource.id
            else:
                resource_type = type(resource).__name__
                resource_name = str(resource)
                resource_id = getattr(resource, 'id', 0)
            
            # Créer l'enregistrement d'audit
            audit = cls.objects.create(
                action=action,
                user=user,
                content_type=ContentType.objects.get_for_model(resource),
                object_id=resource_id,
                resource_type=resource_type,
                resource_name=resource_name,
                resource_id=resource_id,
                projet=projet,
                description=description,
                data_before=data_before,
                data_after=data_after,
                ip_address=ip_address,
                user_agent=user_agent,
                session_id=session_id,
                context=context
            )
            
            return audit
        except Exception as e:
            # En cas d'erreur, on log mais on ne fait pas échouer l'opération principale
            print(f"Erreur lors de l'enregistrement de l'audit: {e}")
            return None