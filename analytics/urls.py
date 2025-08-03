from rest_framework.routers import DefaultRouter
from .views import AnalyticsDataViewSet

router = DefaultRouter()
router.register(r'analytics', AnalyticsDataViewSet, basename='analyticsdata')

urlpatterns = router.urls
