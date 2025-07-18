from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from projects.models import Projet, Phase, Risque
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

class PredictRiskView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, projet_id):
        try:
            projet = Projet.objects.get(id=projet_id)
            phases = Phase.objects.filter(projet=projet)
            data = {
                'budget_total': [projet.budget_total],
                'jours_restants': [(projet.date_fin_prevue - projet.date_debut).days],
                'avancement_moyen': [sum(phase.pourcentage_avancement for phase in phases) / len(phases) if phases else 0],
            }
            df = pd.DataFrame(data)
            model = joblib.load('path/to/model.pkl')  # Modèle pré-entraîné
            prediction = model.predict_proba(df)[0][1]  # Probabilité de retard
            risque = Risque.objects.create(
                projet=projet,
                type_risque='RETARD',
                probabilite=prediction,
                impact=0.5,  # À ajuster
                description='Risque de retard prédit par le modèle IA',
                recommandation='Vérifier les ressources allouées.'
            )
            from projects.serializers import RisqueSerializer
            serializer = RisqueSerializer(risque)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Projet.DoesNotExist:
            return Response({'error': 'Projet non trouvé'}, status=status.HTTP_404_NOT_FOUND)