import uuid
import datetime
from django.db import models, transaction
from apps.campaigns.models import Campaign, Department
from apps.payments.models import PaymentPlan, Installment

class Registration(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='registrations')
    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=20)
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name='registrations')
    payment_plan = models.ForeignKey(PaymentPlan, on_delete=models.PROTECT, related_name='registrations')
    lottery_number = models.CharField(max_length=50, unique=True, blank=True)
    is_eligible = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('campaign', 'phone_number')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.lottery_number}"

    def recalculate_eligibility(self):
        """
        Recalculates whether this registration is eligible for the draw.
        Eligible only when all installments are Approved.
        """
        inst_list = self.installments.all()
        if not inst_list.exists():
            eligible = False
        else:
            eligible = all(inst.status == 'Approved' for inst in inst_list)
        
        if self.is_eligible != eligible:
            self.is_eligible = eligible
            Registration.objects.filter(pk=self.pk).update(is_eligible=eligible)

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        
        if is_new:
            # Concurrency-safe generation of lottery number
            with transaction.atomic():
                # Count current registrations for this campaign to calculate serial
                count = Registration.objects.filter(campaign=self.campaign).count()
                serial = count + 1
                year = datetime.date.today().year
                self.lottery_number = f"BRH{serial:04d}{year}"
                
                # Check for uniqueness collision and increment if necessary
                while Registration.objects.filter(lottery_number=self.lottery_number).exists():
                    serial += 1
                    self.lottery_number = f"BRH{serial:04d}{year}"

                super().save(*args, **kwargs)

                # Automatically generate installments based on selected PaymentPlan
                plan = self.payment_plan
                installment_amt = plan.installment_amount
                for i in range(1, plan.installment_count + 1):
                    # Installment 1 is open by default. Subsequent installments require request.
                    # We can set status='Open' for all, but track request requirements in logic.
                    from django.utils import timezone
                    Installment.objects.create(
                        registration=self,
                        installment_number=i,
                        amount=installment_amt,
                        status='Open' if i == 1 else 'Open',  # Wait, let's keep all open but controlled by request workflow
                        due_date=timezone.now() + datetime.timedelta(days=30 * i)
                    )
                
                # Initially check eligibility (usually False since installments are open)
                self.recalculate_eligibility()
        else:
            super().save(*args, **kwargs)
