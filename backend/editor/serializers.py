from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Document, DocumentCollaborator

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class DocumentCollaboratorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = DocumentCollaborator
        fields = ['user', 'permission', 'joined_at']

class DocumentSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    collaborators = DocumentCollaboratorSerializer(many=True, read_only=True)
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'content', 'language', 'created_at', 'updated_at', 'owner', 'collaborators']
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner']
