from rest_framework import serializers
from .models import Registration
from apps.campaigns.serializers import CampaignSerializer, DepartmentSerializer
from apps.payments.serializers import InstallmentSerializer

class RegistrationSerializer(serializers.ModelSerializer):
    campaign_detail = CampaignSerializer(source='campaign', read_only=True)
    department_detail = DepartmentSerializer(source='department', read_only=True)
    payment_plan_detail = serializers.SerializerMethodField(read_only=True)
    installments = InstallmentSerializer(many=True, read_only=True)

    class Meta:
        model = Registration
        fields = [
            'id', 'campaign', 'campaign_detail', 'full_name', 'phone_number', 
            'department', 'department_detail', 'payment_plan', 'payment_plan_detail', 
            'lottery_number', 'is_eligible', 'installments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['lottery_number', 'is_eligible']

    def get_payment_plan_detail(self, obj):
        return {
            'id': obj.payment_plan.id,
            'name': obj.payment_plan.name,
            'base_amount': obj.payment_plan.base_amount,
            'penalty_amount': obj.payment_plan.penalty_amount,
            'installment_count': obj.payment_plan.installment_count,
            'total_amount': obj.payment_plan.total_amount,
            'installment_amount': obj.payment_plan.installment_amount
        }

    def validate_phone_number(self, value):
        # Format/length validation or standard check if needed
        return value

    def validate(self, data):
        # Verify that department is Active
        dept = data.get('department')
        if dept and dept.status != 'Active':
            raise serializers.ValidationError({"department": "Selected department is inactive."})

        # Verify that campaign is Active
        camp = data.get('campaign')
        if camp and camp.status != 'Active':
            raise serializers.ValidationError({"campaign": "Registration is only open for active campaigns."})

        # Verify that the registration is within dates
        from django.utils import timezone
        current_time = timezone.now()
        if current_time < camp.registration_start_date or current_time > camp.registration_end_date:
            raise serializers.ValidationError({"campaign": "Registration period for this campaign has closed or not started yet."})

        # Check unique constraint (campaign, phone_number)
        phone = data.get('phone_number')
        if Registration.objects.filter(campaign=camp, phone_number=phone).exists():
            raise serializers.ValidationError({"phone_number": "This phone number is already registered for this campaign."})

        return data
