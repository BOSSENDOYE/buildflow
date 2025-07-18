from django.db import models
from projects.models import Projet
from django.contrib.auth.models import User

class Document(models.Model):
    TYPE_CHOICES = (
        ('PLAN', 'Plan'),
        ('CONTRAT', 'Contrat'),
        ('RAPPORT', 'Rapport'),
        ('PV', 'PV de réception'),
    )
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='documents')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    nom = models.CharField(max_length=255)
    fichier = models.FileField(upload_to='documents/%Y/%m/%d/')
    date_upload = models.DateTimeField(auto_now_add=True)
    auteur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.projet.nom} - {self.nom}"