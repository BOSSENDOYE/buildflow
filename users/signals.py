from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import ProfilUtilisateur


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        role = 'ADMINISTRATEUR' if instance.is_superuser else 'GESTIONNAIRE'
        ProfilUtilisateur.objects.create(utilisateur=instance, role=role)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    # S'assurer que tous les utilisateurs ont un profil
    if not hasattr(instance, 'profilutilisateur'):
        role = 'ADMINISTRATEUR' if instance.is_superuser else 'GESTIONNAIRE'
        ProfilUtilisateur.objects.create(utilisateur=instance, role=role)

