from django.db import models
from django.contrib.auth.models import User

class ProfilUtilisateur(models.Model):
    ROLE_CHOICES = (
        ('GESTIONNAIRE', 'Gestionnaire de Projet'),
        ('ADMINISTRATEUR', 'Administrateur Système'),
        ('CONSULTANT', 'Consultant'),
    )
    
    utilisateur = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='GESTIONNAIRE')
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    actif = models.BooleanField(default=True)
    
    # Permissions spécifiques
    peut_creer_projet = models.BooleanField(default=True)
    peut_modifier_projet = models.BooleanField(default=True)
    peut_supprimer_projet = models.BooleanField(default=False)
    peut_gerer_utilisateurs = models.BooleanField(default=False)
    peut_voir_analytics = models.BooleanField(default=True)
    peut_exporter_donnees = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.utilisateur.username} - {self.get_role_display()}"
    
    def get_permissions(self):
        """Retourne les permissions de l'utilisateur"""
        permissions = {
            'peut_creer_projet': self.peut_creer_projet,
            'peut_modifier_projet': self.peut_modifier_projet,
            'peut_supprimer_projet': self.peut_supprimer_projet,
            'peut_gerer_utilisateurs': self.peut_gerer_utilisateurs,
            'peut_voir_analytics': self.peut_voir_analytics,
            'peut_exporter_donnees': self.peut_exporter_donnees,
        }
        
        # Permissions basées sur le rôle
        if self.role == 'ADMINISTRATEUR':
            permissions.update({
                'peut_creer_projet': True,
                'peut_modifier_projet': True,
                'peut_supprimer_projet': True,
                'peut_gerer_utilisateurs': True,
                'peut_voir_analytics': True,
                'peut_exporter_donnees': True,
            })
        elif self.role == 'GESTIONNAIRE':
            permissions.update({
                'peut_creer_projet': True,
                'peut_modifier_projet': True,
                'peut_supprimer_projet': False,
                'peut_gerer_utilisateurs': False,
                'peut_voir_analytics': True,
                'peut_exporter_donnees': True,
            })
        elif self.role == 'CONSULTANT':
            permissions.update({
                'peut_creer_projet': False,
                'peut_modifier_projet': False,
                'peut_supprimer_projet': False,
                'peut_gerer_utilisateurs': False,
                'peut_voir_analytics': True,
                'peut_exporter_donnees': True,
            })

        
        return permissions
    
    def has_permission(self, permission_name):
        """Vérifie si l'utilisateur a une permission spécifique"""
        permissions = self.get_permissions()
        return permissions.get(permission_name, False)