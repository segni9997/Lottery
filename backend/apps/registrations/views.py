from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from django.db.models import Q, Count
from django.http import HttpResponse
from openpyxl import Workbook
from .models import Registration
from .serializers import RegistrationSerializer

class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.all().order_by('-created_at')
    serializer_class = RegistrationSerializer

    def get_permissions(self):
        if self.action in ['create', 'lookup']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['campaign', 'department', 'is_eligible']
    search_fields = ['full_name', 'phone_number', 'lottery_number']

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def lookup(self, request):
        """
        Public search lookup endpoint.
        Query parameters: ?q=phone_or_lottery_number
        Returns registrations matching the term.
        """
        query = request.query_params.get('q', '').strip()
        campaign_id = request.query_params.get('campaign_id', None)
        
        if not query:
            return Response(
                {"detail": "Query parameter 'q' is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        filter_q = Q(lottery_number=query) | Q(phone_number=query)
        queryset = Registration.objects.filter(filter_q)
        
        if campaign_id:
            queryset = queryset.filter(campaign_id=campaign_id)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def report(self, request):
        """
        Admin action to download registrations report in Excel format.
        Query parameters: ?campaign_id=uuid
        """
        campaign_id = request.query_params.get('campaign_id')
        if not campaign_id:
            return Response(
                {"detail": "campaign_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        registrations = Registration.objects.filter(campaign_id=campaign_id).select_related(
            'campaign', 'department', 'payment_plan'
        ).order_by('department__name', 'full_name')

        wb = Workbook()
        
        # Sheet 1: Registration List
        ws = wb.active
        ws.title = "Registration Details"
        ws.append([
            "Lottery Number", "Full Name", "Phone Number", 
            "Department", "Payment Plan", "Eligibility Status", "Date Registered"
        ])
        
        for reg in registrations:
            ws.append([
                reg.lottery_number,
                reg.full_name,
                reg.phone_number,
                reg.department.name,
                reg.payment_plan.name,
                "Eligible" if reg.is_eligible else "Not Eligible",
                reg.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])

        # Sheet 2: Summary by Department
        ws2 = wb.create_sheet(title="Department Summary")
        ws2.append(["Department Code", "Department Name", "Total Registrations", "Eligible Count"])
        
        dept_summary = Registration.objects.filter(campaign_id=campaign_id).values(
            'department__code', 'department__name'
        ).annotate(
            total=Count('id'),
            eligible=Count('id', filter=Q(is_eligible=True))
        ).order_by('-total')

        for item in dept_summary:
            ws2.append([
                item['department__code'],
                item['department__name'],
                item['total'],
                item['eligible']
            ])

        # Generate HTTP response with content type excel
        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = f'attachment; filename="lottery_report_{campaign_id}.xlsx"'
        wb.save(response)
        return response
