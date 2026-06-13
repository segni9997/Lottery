from django.contrib import admin
from .models import Winner, AuditLog

@admin.register(Winner)
class WinnerAdmin(admin.ModelAdmin):
    list_display = ('campaign', 'registration', 'rank', 'prize_description', 'draw_time')
    list_filter = ('campaign', 'rank')
    search_fields = ('registration__lottery_number', 'registration__full_name', 'prize_description')
    ordering = ('rank',)
    readonly_fields = ('draw_time',)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'performed_by', 'timestamp')
    list_filter = ('action',)
    search_fields = ('action', 'performed_by__username')
    ordering = ('-timestamp',)
    readonly_fields = ('action', 'performed_by', 'details', 'timestamp')
