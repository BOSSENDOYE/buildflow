from django.contrib import admin
from .models import ProfilUtilisateur

@admin.register(ProfilUtilisateur)
class ProfilUtilisateurAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'role')
    search_fields = ('utilisateur__username', 'role')