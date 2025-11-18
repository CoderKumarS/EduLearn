from django.contrib import admin
from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    """Inline admin for messages within a conversation"""
    model = Message
    extra = 0
    readonly_fields = ['id', 'role', 'content', 'timestamp', 'tokens_used']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    """Admin interface for Conversation model"""
    
    list_display = ['id', 'student', 'course', 'title', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['student__username', 'student__email', 'title']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [MessageInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student', 'course')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Admin interface for Message model"""
    
    list_display = ['id', 'conversation', 'role', 'content_preview', 'timestamp', 'tokens_used']
    list_filter = ['role', 'timestamp']
    search_fields = ['content', 'conversation__student__username']
    readonly_fields = ['id', 'timestamp']
    
    def content_preview(self, obj):
        """Show preview of message content"""
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    
    content_preview.short_description = 'Content'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('conversation', 'conversation__student')
