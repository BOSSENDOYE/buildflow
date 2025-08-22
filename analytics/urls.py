from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import AnalyticsDataViewSet, predict_delay, predict_budget_overrun, recommendations

router = DefaultRouter()
router.register(r'analytics', AnalyticsDataViewSet, basename='analyticsdata')

urlpatterns = [
    *router.urls,
    path('predict/delay/', predict_delay, name='predict_delay'),
    path('predict/budget_overrun/', predict_budget_overrun, name='predict_budget_overrun'),
    path('recommendations/', recommendations, name='recommendations'),
]
