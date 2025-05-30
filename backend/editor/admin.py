from django.contrib import admin
from .models import Document, DocumentCollaborator

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'language', 'created_at', 'updated_at']
    list_filter = ['language', 'created_at']
    search_fields = ['title', 'owner__username']

@admin.register(DocumentCollaborator)
class DocumentCollaboratorAdmin(admin.ModelAdmin):
    list_display = ['document', 'user', 'permission', 'joined_at']
    list_filter = ['permission', 'joined_at']
