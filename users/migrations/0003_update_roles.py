from django.db import migrations

def update_old_roles(apps, schema_editor):
    """
    Met à jour les anciens rôles vers les nouveaux rôles autorisés
    """
    ProfilUtilisateur = apps.get_model('users', 'ProfilUtilisateur')
    
    # Mettre à jour SUPERVISEUR vers GESTIONNAIRE
    ProfilUtilisateur.objects.filter(role='SUPERVISEUR').update(role='GESTIONNAIRE')
    
    # Mettre à jour OBSERVATEUR vers CONSULTANT
    ProfilUtilisateur.objects.filter(role='OBSERVATEUR').update(role='CONSULTANT')

def reverse_update_old_roles(apps, schema_editor):
    """
    Fonction de rollback (optionnelle)
    """
    ProfilUtilisateur = apps.get_model('users', 'ProfilUtilisateur')
    
    # Remettre SUPERVISEUR
    ProfilUtilisateur.objects.filter(role='GESTIONNAIRE').update(role='SUPERVISEUR')
    
    # Remettre OBSERVATEUR
    ProfilUtilisateur.objects.filter(role='CONSULTANT').update(role='OBSERVATEUR')

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_profilutilisateur_actif_and_more'),
    ]

    operations = [
        migrations.RunPython(update_old_roles, reverse_update_old_roles),
    ] 