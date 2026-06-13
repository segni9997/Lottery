from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PaymentPlanViewSet, 
    InstallmentViewSet, 
    InstallmentRequestViewSet, 
    PaymentProofViewSet
)

router = DefaultRouter()
router.register('plans', PaymentPlanViewSet, basename='paymentplan')
router.register('installments', InstallmentViewSet, basename='installment')
router.register('requests', InstallmentRequestViewSet, basename='installmentrequest')
router.register('proofs', PaymentProofViewSet, basename='paymentproof')

urlpatterns = [
    path('', include(router.urls)),
]
