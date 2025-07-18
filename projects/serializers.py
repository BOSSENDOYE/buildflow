from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Projet, Phase, Budget, Risque, Action, Notification, Commentaire

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ProjetSerializer(serializers.ModelSerializer):
    chef_projet = UserSerializer(read_only=True)
    membres = UserSerializer(many=True, read_only=True)
    phases_count = serializers.SerializerMethodField()
    actions_count = serializers.SerializerMethodField()
    risques_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Projet
        fields = '__all__'
    
    def get_phases_count(self, obj):
        return obj.phases.count()
    
    def get_actions_count(self, obj):
        return obj.actions.count()
    
    def get_risques_count(self, obj):
        return obj.risques.count()

class PhaseSerializer(serializers.ModelSerializer):
    projet = ProjetSerializer(read_only=True)
    actions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Phase
        fields = '__all__'
    
    def get_actions_count(self, obj):
        return obj.actions.count()

class BudgetSerializer(serializers.ModelSerializer):
    projet = ProjetSerializer(read_only=True)
    
    class Meta:
        model = Budget
        fields = '__all__'

class RisqueSerializer(serializers.ModelSerializer):
    projet = ProjetSerializer(read_only=True)
    responsable = UserSerializer(read_only=True)
    
    class Meta:
        model = Risque
        fields = '__all__'

class ActionSerializer(serializers.ModelSerializer):
    projet = ProjetSerializer(read_only=True)
    phase = PhaseSerializer(read_only=True)
    responsable = UserSerializer(read_only=True)
    
    class Meta:
        model = Action
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    utilisateur = UserSerializer(read_only=True)
    projet = ProjetSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'

class CommentaireSerializer(serializers.ModelSerializer):
    projet = ProjetSerializer(read_only=True)
    auteur = UserSerializer(read_only=True)
    
    class Meta:
        model = Commentaire
        fields = '__all__'