from django.urls import path
from .views import PredictRiskView

urlpatterns = [
    path('predict_risk/<int:projet_id>/', PredictRiskView.as_view(), name='predict_risk'),
]