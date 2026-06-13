import uuid
from django.db import models
from django.conf import settings
from apps.campaigns.models import Campaign
from apps.registrations.models import Registration

class Winner(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='winners')
    registration = models.ForeignKey(Registration, on_delete=models.CASCADE, related_name='wins')
    draw_time = models.DateTimeField(auto_now_add=True)
    rank = models.PositiveIntegerField()
    prize_description = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        ordering = ['rank']
        unique_together = ('campaign', 'registration')

    def __str__(self):
        return f"{self.registration.full_name} wins rank {self.rank} in {self.campaign.title}"


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    action = models.CharField(max_length=150)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='audit_logs'
    )
    details = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        username = self.performed_by.username if self.performed_by else "System"
        return f"{self.action} by {username} at {self.timestamp}"
