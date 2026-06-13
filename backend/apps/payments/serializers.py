from rest_framework import serializers
from .models import PaymentPlan, Installment, InstallmentRequest, PaymentProof

class PaymentPlanSerializer(serializers.ModelSerializer):
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    installment_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = PaymentPlan
        fields = '__all__'


class PaymentProofSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentProof
        fields = '__all__'


class InstallmentRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstallmentRequest
        fields = '__all__'


class InstallmentSerializer(serializers.ModelSerializer):
    requests = InstallmentRequestSerializer(many=True, read_only=True)
    proof = PaymentProofSerializer(read_only=True)
    
    class Meta:
        model = Installment
        fields = ['id', 'registration', 'installment_number', 'amount', 'status', 'due_date', 'requests', 'proof', 'created_at', 'updated_at']
