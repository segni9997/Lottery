from rest_framework import serializers
from .models import Winner, AuditLog
from apps.registrations.serializers import RegistrationSerializer

class WinnerSerializer(serializers.ModelSerializer):
    registration_detail = RegistrationSerializer(source='registration', read_only=True)
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)

    class Meta:
        model = Winner
        fields = ['id', 'campaign', 'campaign_title', 'registration', 'registration_detail', 'draw_time', 'rank', 'prize_description']
        read_only_fields = ['draw_time']


class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='performed_by.username', read_only=True, default="System")

    class Meta:
        model = AuditLog
        fields = ['id', 'action', 'performed_by', 'username', 'details', 'timestamp']
        read_only_fields = ['timestamp']
