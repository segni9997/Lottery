import uuid
from django.db import models

class Department(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class Campaign(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Active', 'Active'),
        ('Closed', 'Closed'),
        ('Drawn', 'Drawn'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    holiday_name = models.CharField(max_length=100)
    description = models.TextField()
    banner_image = models.ImageField(upload_to='campaigns/banners/', blank=True, null=True)
    cover_image = models.ImageField(upload_to='campaigns/covers/', blank=True, null=True)
    draw_date = models.DateTimeField()
    registration_start_date = models.DateTimeField()
    registration_end_date = models.DateTimeField()
    telegram_link = models.URLField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
