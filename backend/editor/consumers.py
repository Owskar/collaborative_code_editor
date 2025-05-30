import json
import asyncio
import os
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Document
import redis.asyncio as redis

class YjsSyncConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.redis = None
        self.document_id = None
        self.room_group_name = None
        self.user_id = None
        self.user_color = None
        
    async def connect(self):
        self.document_id = self.scope['url_route']['kwargs']['document_id']
        self.room_group_name = f'document_{self.document_id}'
        # self.user_id = self.scope.get('user', {}).get('id', 'anonymous')
        user = self.scope.get('user')
        self.user_id = user.id if user and user.is_authenticated else 'anonymous'

        self.user_color = self.generate_user_color()
        
        # Initialize Redis connection - Use environment variable or default to Redis service
        redis_url = os.getenv('REDIS_URL', 'redis://redis:6379/0')
        self.redis = redis.from_url(redis_url)
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send initial document state and awareness
        await self.send_document_state()
        await self.send_awareness_update()
    
    async def disconnect(self, close_code):
        # Leave room group
        if self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        
        # Close Redis connection
        if self.redis:
            await self.redis.close()
    
    async def receive(self, text_data=None, bytes_data=None):
        try:
            if text_data:
                message = json.loads(text_data)
            elif bytes_data:
                message = json.loads(bytes_data.decode('utf-8'))
            else:
                return
                
            message_type = message.get('type')
            
            if message_type == 'yjs-update':
                await self.handle_yjs_update(message)
            elif message_type == 'awareness-update':
                await self.handle_awareness_update(message)
            elif message_type == 'cursor-update':
                await self.handle_cursor_update(message)
                
        except (json.JSONDecodeError, UnicodeDecodeError):
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
    
    async def handle_yjs_update(self, message):
        update_data = message.get('update')
        
        # Store update in Redis for persistence
        await self.redis.lpush(
            f'yjs_updates:{self.document_id}',
            json.dumps(update_data)
        )
        
        # Broadcast to all clients in the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'yjs_update',
                'update': update_data,
                'sender_id': self.user_id
            }
        )
        
        # Update document content in database
        await self.update_document_content(message.get('content', ''))
    
    async def handle_awareness_update(self, message):
        awareness_data = message.get('awareness', {})
        awareness_data['user_id'] = self.user_id
        awareness_data['color'] = self.user_color
        
        # Broadcast awareness to all clients
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'awareness_update',
                'awareness': awareness_data,
                'sender_id': self.user_id
            }
        )
    
    async def handle_cursor_update(self, message):
        cursor_data = message.get('cursor', {})
        cursor_data['user_id'] = self.user_id
        cursor_data['color'] = self.user_color
        
        # Broadcast cursor position to all clients
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'cursor_update',
                'cursor': cursor_data,
                'sender_id': self.user_id
            }
        )
    
    # Group message handlers
    async def yjs_update(self, event):
        if event['sender_id'] != self.user_id:
            await self.send(text_data=json.dumps({
                'type': 'yjs-update',
                'update': event['update']
            }))
    
    async def awareness_update(self, event):
        if event['sender_id'] != self.user_id:
            await self.send(text_data=json.dumps({
                'type': 'awareness-update',
                'awareness': event['awareness']
            }))
    
    async def cursor_update(self, event):
        if event['sender_id'] != self.user_id:
            await self.send(text_data=json.dumps({
                'type': 'cursor-update',
                'cursor': event['cursor']
            }))
    
    async def send_document_state(self):
        try:
            # Get stored Yjs updates from Redis
            updates = await self.redis.lrange(f'yjs_updates:{self.document_id}', 0, -1)
            
            if updates:
                # Send all updates to sync the document state
                for update_json in reversed(updates):
                    update_data = json.loads(update_json)
                    await self.send(text_data=json.dumps({
                        'type': 'yjs-update',
                        'update': update_data
                    }))
        except Exception as e:
            print(f"Error sending document state: {e}")
    
    async def send_awareness_update(self):
        await self.send(text_data=json.dumps({
            'type': 'user-joined',
            'user_id': self.user_id,
            'color': self.user_color
        }))
    
    @database_sync_to_async
    def update_document_content(self, content):
        try:
            document = Document.objects.get(id=self.document_id)
            document.content = content
            document.save()
        except Document.DoesNotExist:
            pass
    
    def generate_user_color(self):
        colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
            '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
        ]
        import hashlib
        hash_object = hashlib.md5(str(self.user_id).encode())
        hash_hex = hash_object.hexdigest()
        color_index = int(hash_hex, 16) % len(colors)
        return colors[color_index]