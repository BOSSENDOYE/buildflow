from django.contrib import admin
from .models import Projet, Phase, Budget, Risque, Action, Notification, Commentaire

@admin.register(Projet)
class ProjetAdmin(admin.ModelAdmin):
    list_display = ('nom', 'statut', 'chef_projet', 'date_debut', 'date_fin_prevue')
    list_filter = ('statut', 'date_debut', 'date_fin_prevue')
    search_fields = ('nom', 'description')
    filter_horizontal = ('membres',)

@admin.register(Phase)
class PhaseAdmin(admin.ModelAdmin):
    list_display = ('projet', 'nom', 'statut', 'date_debut', 'date_fin_prevue', 'ordre')
    list_filter = ('statut', 'date_debut')
    search_fields = ('nom', 'description')
    ordering = ('projet', 'ordre')

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('projet', 'type', 'montant', 'date', 'description')
    list_filter = ('type', 'date')
    search_fields = ('projet__nom', 'description')

@admin.register(Risque)
class RisqueAdmin(admin.ModelAdmin):
    list_display = ('projet', 'nom', 'niveau', 'probabilite', 'responsable')
    list_filter = ('niveau', 'probabilite', 'date_identification')
    search_fields = ('nom', 'description', 'impact')

@admin.register(Action)
class ActionAdmin(admin.ModelAdmin):
    list_display = ('projet', 'titre', 'statut', 'responsable', 'priorite', 'date_fin_prevue')
    list_filter = ('statut', 'priorite', 'date_debut', 'date_fin_prevue')
    search_fields = ('titre', 'description')
    ordering = ('projet', 'priorite')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'type', 'titre', 'lu', 'date_creation')
    list_filter = ('type', 'lu', 'date_creation')
    search_fields = ('titre', 'message')
    ordering = ('-date_creation',)

@admin.register(Commentaire)
class CommentaireAdmin(admin.ModelAdmin):
    list_display = ('projet', 'auteur', 'contenu', 'date_creation')
    list_filter = ('date_creation',)
    search_fields = ('contenu', 'auteur__username')
    ordering = ('-date_creation',)