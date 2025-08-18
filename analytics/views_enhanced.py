"""
Enhanced analytics views with improved ML model integration
"""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from datetime import date
import math
import warnings
warnings.filterwarnings('ignore')

from ml.inference import predict_from_input
from projects.models import Projet, Phase, Budget, Risque
from .models import AnalyticsData
from .serializers import AnalyticsDataSerializer

class AnalyticsDataViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsData.objects.all()
    serializer_class = AnalyticsDataSerializer
    permission_classes = [IsAuthenticated]

def _aggregate_project_features(projet: Projet) -> dict:
    """Aggregate project features for ML prediction"""
    # Durées
    planned_days = (projet.date_fin_prevue - projet.date_debut).days
    today = date.today()
    days_elapsed = max(0, (min(today, projet.date_fin_prevue) - projet.date_debut).days)
    days_left = (projet.date_fin_prevue - today).days

    # Phases
    phases = Phase.objects.filter(projet=projet)
    total_phases = phases.count() or 1
    done_phases = phases.filter(statut='TERMINEE').count()
    progress_ratio = done_phases / total_phases

    # Budgets
    budget_prevu = float(projet.budget_prevue or 0)
    budget_reel_projet = float(projet.budget_reel or 0)
    budget_reel_lignes = float(Budget.objects.filter(projet=projet, type='REEL').aggregate(s=Sum('montant'))['s'] or 0)
    spent = budget_reel_lignes or budget_reel_projet
    budget_ratio = (spent / budget_prevu) if budget_prevu > 0 else 0

    # Risques
    nb_risques = Risque.objects.filter(projet=projet).count()

    return {
        'planned_days': planned_days,
        'days_elapsed': days_elapsed,
        'days_left': days_left,
        'progress_ratio': progress_ratio,
        'budget_ratio': budget_ratio,
        'nb_risques': nb_risques,
        'statut': projet.statut,
    }

def _rule_based_delay_probability(f: dict) -> float:
    """Heuristic rule-based delay probability calculation"""
    time_pressure = 0.0
    if f['planned_days'] > 0:
        time_pressure = f['days_elapsed'] / max(1, f['planned_days'])
    low_progress_penalty = 1 - f['progress_ratio']
    risk_factor = min(1.0, 0.5 * time_pressure + 0.4 * low_progress_penalty + 0.1 * (f['nb_risques'] > 0))
    return round(risk_factor, 3)

def _rule_based_budget_overrun_probability(f: dict) -> float:
    """Heuristic rule-based budget overrun probability calculation"""
    gap = max(0.0, f['budget_ratio'] - max(0.01, f['progress_ratio']))
    risk = min(1.0, 0.6 * gap + 0.2 * (f['nb_risques'] > 0) + 0.2 * (f['days_left'] < 0))
    return round(risk, 3)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def predict_delay_enhanced(request):
    """Enhanced delay prediction endpoint"""
    projet_id = request.query_params.get('projet')
    if not projet_id:
        return Response({'detail': 'Paramètre "projet" requis'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        projet = Projet.objects.get(id=projet_id)
    except Projet.DoesNotExist:
        return Response({'detail': 'Projet introuvable'}, status=status.HTTP_404_NOT_FOUND)

    features = _aggregate_project_features(projet)
    
    # Use ML models if available, fallback to heuristics
    try:
        ml = predict_from_input(
            progress_percent=max(0.0, min(100.0, features['progress_ratio'] * 100)),
            budget_spent=max(0.0, min(100.0, features['budget_ratio'] * 100)),
            weather=1,
            incidents=int(features['nb_risques'] or 0),
        )
        
        return Response({
            'project_id': projet.id,
            'delay_probability': round((ml['delay_probability'] or 0), 1),
            'budget_overrun_estimate': round((ml['budget_overrun_estimate'] or 0), 1),
            'recommendations': ml['recommendations'],
            'features': features,
        })
    except Exception:
        prob = _rule_based_delay_probability(features)
        return Response({
            'project_id': projet.id,
            'delay_probability': prob,
            'features': features,
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def predict_budget_overrun_enhanced(request):
    """Enhanced budget overrun prediction endpoint"""
    projet_id = request.query_params.get('projet')
    if not projet_id:
        return Response({'detail': 'Paramètre "projet" requis'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        projet = Projet.objects.get(id=projet_id)
    except Projet.DoesNotExist:
        return Response({'detail': 'Projet introuvable'}, status=status.HTTP_404_NOT_FOUND)

    features = _aggregate_project_features(projet)
    
    try:
        ml = predict_from_input(
            progress_percent=max(0.0, min(100.0, features['progress_ratio'] * 100)),
            budget_spent=max(0.0, min(100.0, features['budget_ratio'] * 100)),
            weather=1,
            incidents=int(features['nb_risques'] or 0),
        )
        
        return Response({
            'project_id': projet.id,
            'budget_overrun_estimate': round((ml['budget_overrun_estimate'] or 0), 1),
            'recommendations': ml['recommendations'],
            'features': features,
        })
    except Exception:
        prob = _rule_based_budget_overrun_probability(features)
        return Response({
            'project_id': projet.id,
            'budget_overrun_estimate': prob,
            'features': features,
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommendations_enhanced(request):
    """Enhanced recommendations endpoint"""
    projet_id = request.query_params.get('projet')
    if not projet_id:
        return Response({'detail': 'Paramètre "projet" requis'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        projet = Projet.objects.get(id=projet_id)
    except Projet.DoesNotExist:
        return Response({'detail': 'Projet introuvable'}, status=status.HTTP_404_NOT_FOUND)

    features = _aggregate_project_features(projet)
    
    # Generate recommendations
    recs = []
    if f['progress_ratio'] < 0.5 and f['days_left'] <= (f['planned_days'] * 0.5):
        recs.append("Accélérer les phases critiques et réallouer des ressources.")
    if f['budget_ratio'] > 1.0:
        recs.append("Mettre en place un gel des dépenses non essentielles et renégocier les contrats.")
    if f['nb_risques'] > 0:
        recs.append("Revoir le registre des risques et définir des plans de mitigation immédiats.")
    if not recs:
        recs.append("Poursuivre selon le plan actuel tout en surveillant les jalons clés.")
    
    try:
        ml = predict_from_input(
            progress_percent=max(0.0, min(100.0, f['progress_ratio'] * 100)),
            budget_spent=max(0.0, min(100.0, f['budget_ratio'] * 100)),
            weather=1,
            incidents=int(f['nb_risques'] or 0),
        )
        recs = list({*recs, *ml['recommendations']})  # Merge without duplicates
    except Exception:
        pass
    
    return Response({
        'project_id': projet.id,
        'recommendations': recs,
        'features': f
    })
