from django.contrib import admin
from .models import Department, Campaign

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('name', 'code')
    ordering = ('name',)


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('title', 'holiday_name', 'status', 'draw_date', 'registration_start_date', 'registration_end_date')
    list_filter = ('status', 'draw_date')
    search_fields = ('title', 'holiday_name')
    ordering = ('-created_at',)
