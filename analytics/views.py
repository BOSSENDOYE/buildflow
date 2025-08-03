from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import AnalyticsData
from .serializers import AnalyticsDataSerializer

class AnalyticsDataViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsData.objects.all()
    serializer_class = AnalyticsDataSerializer
    permission_classes = [IsAuthenticated]
