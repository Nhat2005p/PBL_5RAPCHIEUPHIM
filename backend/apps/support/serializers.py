from rest_framework import serializers
from .models import ChatMessage, SystemLog

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    receiver_name = serializers.CharField(source='receiver.username', read_only=True, default="Admin")
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'sender_name', 'receiver', 'receiver_name', 'message', 'is_read', 'created_at']
        read_only_fields = ['sender', 'is_read']

class SystemLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.username', read_only=True, default="Hệ thống")
    
    class Meta:
        model = SystemLog
        fields = '__all__'