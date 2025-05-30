from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Q  # Add this import
from .models import Document, DocumentCollaborator
from .serializers import DocumentSerializer, DocumentCollaboratorSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    
    def get_queryset(self):
        return Document.objects.filter(
            Q(owner=self.request.user) |  # Changed from models.Q to Q
            Q(collaborators__user=self.request.user)  # Changed from models.Q to Q
        ).distinct()
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_collaborator(self, request, pk=None):
        document = self.get_object()
        username = request.data.get('username')
        permission = request.data.get('permission', 'write')
        
        try:
            user = User.objects.get(username=username)
            collaborator, created = DocumentCollaborator.objects.get_or_create(
                document=document,
                user=user,
                defaults={'permission': permission}
            )
            
            if not created:
                collaborator.permission = permission
                collaborator.save()
            
            return Response({'status': 'collaborator added'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )