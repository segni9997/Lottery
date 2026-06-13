import uuid
from django.db import models

class PaymentPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    base_amount = models.DecimalField(max_digits=10, decimal_places=2)
    penalty_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    installment_count = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_amount(self):
        return self.base_amount + self.penalty_amount

    @property
    def installment_amount(self):
        if self.installment_count <= 0:
            return self.total_amount
        return self.total_amount / self.installment_count

    def __str__(self):
        return f"{self.name} (Base: {self.base_amount}, Penalty: {self.penalty_amount}, Count: {self.installment_count})"


class Installment(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Paid', 'Paid'),
        ('Approved', 'Approved'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    registration = models.ForeignKey(
        'registrations.Registration', 
        on_delete=models.CASCADE, 
        related_name='installments'
    )
    installment_number = models.PositiveIntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Open')
    due_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['installment_number']
        unique_together = ('registration', 'installment_number')

    def __str__(self):
        return f"Installment {self.installment_number} for {self.registration.lottery_number} - {self.status}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recalculate registration eligibility status when installment is approved
        self.registration.recalculate_eligibility()


class InstallmentRequest(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    installment = models.ForeignKey(Installment, on_delete=models.CASCADE, related_name='requests')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Pending')
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Request for {self.installment} - {self.status}"


class PaymentProof(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    installment = models.OneToOneField(Installment, on_delete=models.CASCADE, related_name='proof')
    telegram_message_id = models.CharField(max_length=100, blank=True, null=True)
    telegram_user_id = models.CharField(max_length=100, blank=True, null=True)
    proof_image = models.ImageField(upload_to='payments/proofs/', blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Proof for {self.installment}"
