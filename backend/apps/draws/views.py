import random
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Winner, AuditLog
from .serializers import WinnerSerializer, AuditLogSerializer
from apps.campaigns.models import Campaign
from apps.registrations.models import Registration

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class WinnerViewSet(viewsets.ModelViewSet):
    queryset = Winner.objects.all().order_by('rank')
    serializer_class = WinnerSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['campaign']

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def draw(self, request):
        """
        Trigger a live draw selection for a campaign.
        Body: { "campaign_id": "uuid", "rank": 1, "prize_description": "Car" }
        """
        campaign_id = request.data.get('campaign_id')
        rank = request.data.get('rank')
        prize_description = request.data.get('prize_description', '')

        if not campaign_id or rank is None:
            return Response(
                {"detail": "campaign_id and rank are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Fetch Campaign
        try:
            campaign = Campaign.objects.get(pk=campaign_id)
        except Campaign.DoesNotExist:
            return Response({"detail": "Campaign not found."}, status=status.HTTP_404_NOT_FOUND)

        # Draw date verification
        if campaign.draw_date > timezone.now():
            return Response(
                {"detail": "The official draw date has not arrived yet."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Check if a winner for this rank is already drawn for this campaign
        if Winner.objects.filter(campaign=campaign, rank=rank).exists():
            return Response(
                {"detail": f"A winner for rank {rank} is already drawn for this campaign."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Get all eligible registrations that have not won already
        eligible_pool = Registration.objects.filter(
            campaign=campaign,
            is_eligible=True
        ).exclude(
            wins__campaign=campaign
        )

        pool_count = eligible_pool.count()
        if pool_count == 0:
            return Response(
                {"detail": "No eligible participants available for drawing in this campaign."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4. Perform random selection
        # Select randomly by selecting a random index from the pool
        selected_index = random.randint(0, pool_count - 1)
        winner_registration = eligible_pool[selected_index]

        # 5. Save winner
        winner = Winner.objects.create(
            campaign=campaign,
            registration=winner_registration,
            rank=rank,
            prize_description=prize_description
        )

        # 6. Set campaign to Drawn if it's the final draw or just let admin handle it.
        # Let's set the campaign status to Drawn
        campaign.status = 'Drawn'
        campaign.save()

        # 7. Create Audit Log
        AuditLog.objects.create(
            action="LIVE_DRAW_CONDUCTED",
            performed_by=request.user,
            details={
                "campaign_id": str(campaign.id),
                "campaign_title": campaign.title,
                "winner_name": winner_registration.full_name,
                "winner_lottery_number": winner_registration.lottery_number,
                "rank": rank,
                "prize_description": prize_description,
                "total_eligible_pool": pool_count
            }
        )

        serializer = self.get_serializer(winner)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['action']
