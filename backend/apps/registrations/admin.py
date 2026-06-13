from django.contrib import admin
from .models import Registration

@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ('lottery_number', 'full_name', 'phone_number', 'department', 'payment_plan', 'is_eligible', 'created_at')
    list_filter = ('is_eligible', 'campaign', 'department', 'payment_plan')
    search_fields = ('lottery_number', 'full_name', 'phone_number')
    ordering = ('-created_at',)
    readonly_fields = ('lottery_number', 'is_eligible')
