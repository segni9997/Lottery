from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, CampaignViewSet

router = DefaultRouter()
router.register('departments', DepartmentViewSet, basename='department')
router.register('list', CampaignViewSet, basename='campaign') # wait, 'list' is standard or we can just use '' (empty string)

urlpatterns = [
    path('', include(router.urls)),
]
