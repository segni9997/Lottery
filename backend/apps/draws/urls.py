from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WinnerViewSet, AuditLogViewSet

router = DefaultRouter()
router.register('winners', WinnerViewSet, basename='winner')
router.register('logs', AuditLogViewSet, basename='auditlog')

urlpatterns = [
    path('', include(router.urls)),
]
