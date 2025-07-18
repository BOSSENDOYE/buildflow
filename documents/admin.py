from django.contrib import admin
from .models import Document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('projet', 'nom', 'type', 'date_upload')
    search_fields = ('nom', 'type')