import datetime
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.campaigns.models import Campaign, Department
from apps.payments.models import PaymentPlan, Installment, InstallmentRequest
from apps.registrations.models import Registration
from apps.draws.models import Winner

User = get_user_model()

class LotterySystemTests(TestCase):
    def setUp(self):
        # Create user admin
        self.admin_user = User.objects.create_superuser(
            username='admin', 
            email='admin@example.com', 
            password='password123'
        )
        
        # Create Department
        self.dept_it = Department.objects.create(
            name="Information Technology",
            code="IT",
            description="IT Department",
            status="Active"
        )
        self.dept_hr = Department.objects.create(
            name="Human Resources",
            code="HR",
            description="HR Department",
            status="Inactive"
        )

        # Create Campaign
        self.campaign = Campaign.objects.create(
            title="New Year Staff Lottery 2026",
            holiday_name="New Year",
            description="New year lottery for bank staff",
            draw_date=timezone.now() - datetime.timedelta(days=1),  # Past draw date to allow drawing
            registration_start_date=timezone.now() - datetime.timedelta(days=5),
            registration_end_date=timezone.now() + datetime.timedelta(days=5),
            status="Active"
        )

        # Create Payment Plans
        self.plan_one_time = PaymentPlan.objects.create(
            name="One-Time Plan",
            base_amount=500.00,
            penalty_amount=0.00,
            installment_count=1
        )
        
        self.plan_three_time = PaymentPlan.objects.create(
            name="Three-Time Plan",
            base_amount=500.00,
            penalty_amount=25.00,
            installment_count=3
        )

    def test_payment_plan_formulas(self):
        # One-time math
        self.assertEqual(self.plan_one_time.total_amount, 500.00)
        self.assertEqual(self.plan_one_time.installment_amount, 500.00)

        # Three-time math
        self.assertEqual(self.plan_three_time.total_amount, 525.00)
        self.assertEqual(self.plan_three_time.installment_amount, 175.00)

    def test_registration_and_serial_generation(self):
        # Register user 1
        reg1 = Registration.objects.create(
            campaign=self.campaign,
            full_name="Abebe Kebede",
            phone_number="0911223344",
            department=self.dept_it,
            payment_plan=self.plan_one_time
        )
        
        # Check generated serial number (should match BRH00012026 or current year)
        current_year = datetime.date.today().year
        self.assertEqual(reg1.lottery_number, f"BRH0001{current_year}")

        # Register user 2
        reg2 = Registration.objects.create(
            campaign=self.campaign,
            full_name="Almaz Tesfaye",
            phone_number="0922334455",
            department=self.dept_it,
            payment_plan=self.plan_three_time
        )
        self.assertEqual(reg2.lottery_number, f"BRH0002{current_year}")

        # Check installments are created correctly
        # User 1 should have 1 installment of 500
        self.assertEqual(reg1.installments.count(), 1)
        self.assertEqual(reg1.installments.first().amount, 500.00)

        # User 2 should have 3 installments of 175
        self.assertEqual(reg2.installments.count(), 3)
        self.assertEqual(reg2.installments.first().amount, 175.00)

    def test_eligibility_rules(self):
        reg = Registration.objects.create(
            campaign=self.campaign,
            full_name="Mulugeta Alemu",
            phone_number="0933445566",
            department=self.dept_it,
            payment_plan=self.plan_three_time
        )
        
        # Initially not eligible (installments are open, not approved)
        reg.refresh_from_db()
        self.assertFalse(reg.is_eligible)

        # Approve 1st installment
        inst1 = reg.installments.get(installment_number=1)
        inst1.status = 'Approved'
        inst1.save()
        
        reg.refresh_from_db()
        self.assertFalse(reg.is_eligible)

        # Approve 2nd installment
        inst2 = reg.installments.get(installment_number=2)
        inst2.status = 'Approved'
        inst2.save()
        
        reg.refresh_from_db()
        self.assertFalse(reg.is_eligible)

        # Approve 3rd installment
        inst3 = reg.installments.get(installment_number=3)
        inst3.status = 'Approved'
        inst3.save()
        
        # Now eligible!
        reg.refresh_from_db()
        self.assertTrue(reg.is_eligible)

    def test_live_draw_selection(self):
        # User 1: IT department, eligible (approved installments)
        reg_eligible = Registration.objects.create(
            campaign=self.campaign,
            full_name="Selamawit Girma",
            phone_number="0944556677",
            department=self.dept_it,
            payment_plan=self.plan_one_time
        )
        inst = reg_eligible.installments.first()
        inst.status = 'Approved'
        inst.save()

        # User 2: IT department, ineligible (not approved)
        reg_ineligible = Registration.objects.create(
            campaign=self.campaign,
            full_name="Bekele Chala",
            phone_number="0955667788",
            department=self.dept_it,
            payment_plan=self.plan_one_time
        )

        # Trigger draw via simulated view logic
        # Retrieve all eligible registrations
        eligible_pool = Registration.objects.filter(
            campaign=self.campaign,
            is_eligible=True
        ).exclude(wins__campaign=self.campaign)

        # Pool size should be exactly 1 (only reg_eligible)
        self.assertEqual(eligible_pool.count(), 1)
        self.assertEqual(eligible_pool.first(), reg_eligible)

        # Create winner
        Winner.objects.create(
            campaign=self.campaign,
            registration=reg_eligible,
            rank=1,
            prize_description="Laptop"
        )

        # Now pool should be empty
        eligible_pool = Registration.objects.filter(
            campaign=self.campaign,
            is_eligible=True
        ).exclude(wins__campaign=self.campaign)
        self.assertEqual(eligible_pool.count(), 0)
