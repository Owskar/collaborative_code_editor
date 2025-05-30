from django.db import models
from django.contrib.auth.models import User
import uuid

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    language = models.CharField(max_length=50, default='javascript')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title

class DocumentCollaborator(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='collaborators')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    permission = models.CharField(max_length=10, choices=[
        ('read', 'Read'),
        ('write', 'Write'),
    ], default='write')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['document', 'user']
