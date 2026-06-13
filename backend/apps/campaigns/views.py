from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Department, Campaign
from .serializers import DepartmentSerializer, CampaignSerializer

class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit/create,
    but allow anyone to read.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().order_name = 'name' # Wait, order_by('name')
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status']
    search_fields = ['name', 'code']

    def get_queryset(self):
        # Allow non-admin to only see active departments
        user = self.request.user
        if user and user.is_staff:
            return Department.objects.all().order_by('name')
        return Department.objects.filter(status='Active').order_by('name')


class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all().order_by('-created_at')
    serializer_class = CampaignSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['title', 'holiday_name']
    ordering_fields = ['draw_date', 'created_at']

    def get_queryset(self):
        # Allow non-admin to only see Active, Closed, or Drawn campaigns (exclude Drafts)
        user = self.request.user
        if user and user.is_staff:
            return Campaign.objects.all().order_by('-created_at')
        return Campaign.objects.exclude(status='Draft').order_by('-created_at')
