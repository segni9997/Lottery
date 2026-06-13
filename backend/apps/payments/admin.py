from django.contrib import admin
from .models import PaymentPlan, Installment, InstallmentRequest, PaymentProof

@admin.register(PaymentPlan)
class PaymentPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'base_amount', 'penalty_amount', 'installment_count', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)


@admin.register(Installment)
class InstallmentAdmin(admin.ModelAdmin):
    list_display = ('registration', 'installment_number', 'amount', 'status', 'due_date')
    list_filter = ('status', 'due_date')
    search_fields = ('registration__lottery_number', 'registration__full_name')


@admin.register(InstallmentRequest)
class InstallmentRequestAdmin(admin.ModelAdmin):
    list_display = ('installment', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('installment__registration__lottery_number', 'installment__registration__full_name')


@admin.register(PaymentProof)
class PaymentProofAdmin(admin.ModelAdmin):
    list_display = ('installment', 'telegram_message_id', 'telegram_user_id', 'submitted_at', 'is_verified')
    list_filter = ('is_verified',)
    search_fields = ('installment__registration__lottery_number', 'telegram_user_id')
