from rest_framework import serializers
from .models import Projet, Risque, Phase, Budget, Action, Notification, Commentaire, AuditLog, AuditTrail
from users.serializers import UserSerializer

class ProjetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projet
        fields = '__all__'

class RisqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Risque
        fields = '__all__'

class PhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Phase
        fields = '__all__'

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = '__all__'

class ActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Action
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class CommentaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commentaire
        fields = '__all__'


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'

class AuditTrailSerializer(serializers.ModelSerializer):
    """Serializer pour la traçabilité"""
    
    user = UserSerializer(read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    resource_type_display = serializers.CharField(source='resource_type', read_only=True)
    timestamp_formatted = serializers.CharField(source='get_formatted_timestamp', read_only=True)
    changes_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditTrail
        fields = [
            'id', 'action', 'action_display', 'timestamp', 'timestamp_formatted',
            'user', 'resource_type', 'resource_type_display', 'resource_name', 
            'resource_id', 'projet', 'description', 'data_before', 'data_after',
            'changes_summary', 'ip_address', 'user_agent', 'context'
        ]
        read_only_fields = fields
    
    def get_changes_summary(self, obj):
        """Retourne le résumé des changements pour les modifications"""
        return obj.get_changes_summary()

class AuditTrailListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des audits"""
    
    user = serializers.CharField(source='user.username', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    timestamp_formatted = serializers.CharField(source='get_formatted_timestamp', read_only=True)
    
    class Meta:
        model = AuditTrail
        fields = [
            'id', 'action', 'action_display', 'timestamp', 'timestamp_formatted',
            'user', 'resource_type', 'resource_name', 'resource_id', 'description'
        ]
        read_only_fields = fields
