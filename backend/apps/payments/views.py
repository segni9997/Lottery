from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import PaymentPlan, Installment, InstallmentRequest, PaymentProof
from .serializers import (
    PaymentPlanSerializer, 
    InstallmentSerializer, 
    InstallmentRequestSerializer, 
    PaymentProofSerializer
)

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class PaymentPlanViewSet(viewsets.ModelViewSet):
    queryset = PaymentPlan.objects.all().order_by('name')
    serializer_class = PaymentPlanSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active']


class InstallmentViewSet(viewsets.ModelViewSet):
    queryset = Installment.objects.all()
    serializer_class = InstallmentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['registration', 'status', 'installment_number']

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        """
        Admin action to approve a specific installment manually.
        """
        installment = self.get_object()
        installment.status = 'Approved'
        installment.save()
        return Response({
            'status': 'Approved',
            'message': f'Installment {installment.installment_number} approved successfully.',
            'is_eligible': installment.registration.is_eligible
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def mark_paid(self, request, pk=None):
        """
        Admin action to mark an installment as Paid (pending admin final approval).
        """
        installment = self.get_object()
        installment.status = 'Paid'
        installment.save()
        return Response({
            'status': 'Paid',
            'message': f'Installment {installment.installment_number} marked as Paid.'
        })


class InstallmentRequestViewSet(viewsets.ModelViewSet):
    queryset = InstallmentRequest.objects.all().order_by('-created_at')
    serializer_class = InstallmentRequestSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'installment']

    def create(self, request, *args, **kwargs):
        """
        Public endpoint to request the next installment.
        Expected body: { "installment": "<installment_uuid>" }
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Verify the installment is appropriate for request
        # Next installment can only be requested if previous installments are approved.
        inst = serializer.validated_data['installment']
        
        # Check if there is already a pending request for this installment
        existing = InstallmentRequest.objects.filter(installment=inst, status='Pending').exists()
        if existing:
            return Response(
                {"detail": "A pending request already exists for this installment."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if previous installments are approved
        prev_installments = Installment.objects.filter(
            registration=inst.registration,
            installment_number__lt=inst.installment_number
        )
        for p in prev_installments:
            if p.status != 'Approved':
                return Response(
                    {"detail": f"Cannot request installment {inst.installment_number} because installment {p.installment_number} is not approved yet."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve_request(self, request, pk=None):
        """
        Admin action to approve an installment request.
        Approving the request opens the installment.
        """
        req = self.get_object()
        req.status = 'Approved'
        req.admin_notes = request.data.get('admin_notes', '')
        req.save()

        # Update installment status to Open
        inst = req.installment
        inst.status = 'Open'
        inst.save()

        return Response({
            'status': 'Approved',
            'message': 'Installment request approved. Installment is now Open.'
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject_request(self, request, pk=None):
        """
        Admin action to reject an installment request.
        """
        req = self.get_object()
        req.status = 'Rejected'
        req.admin_notes = request.data.get('admin_notes', '')
        req.save()
        return Response({
            'status': 'Rejected',
            'message': 'Installment request rejected.'
        })


class PaymentProofViewSet(viewsets.ModelViewSet):
    queryset = PaymentProof.objects.all()
    serializer_class = PaymentProofSerializer
    permission_classes = [permissions.IsAdminUser]
