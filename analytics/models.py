from django.db import models

# Aucun modèle spécifique pour analytics
# Les modèles de risques sont dans projects/models.py

class AnalyticsData(models.Model):
    # Exemple de champs, adapte selon tes besoins
    name = models.CharField(max_length=100)
    value = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name