import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.campaigns.models import Campaign, Department
from apps.payments.models import PaymentPlan, Installment
from apps.registrations.models import Registration

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial departments, payment plans, campaigns, and mock registrations.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding database...")

        # 1. Create Superuser if none exists
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@berhanbank.com', 'admin123')
            self.stdout.write(self.style.SUCCESS("Superuser 'admin' created with password 'admin123'"))

        # 2. Seed Departments
        departments_data = [
            ("Information Technology", "IT", "Core IT infrastructure, applications, and support"),
            ("Human Resources", "HR", "Recruitment, payroll, training, and staff relations"),
            ("Finance", "FIN", "Accounting, budget planning, and financial management"),
            ("Operations", "OPS", "Bank backend processing and operations"),
            ("Digital Banking", "DIG", "Mobile, internet banking, and fintech products"),
            ("Risk Management", "RISK", "Compliance and risk evaluation"),
            ("Branch Operations", "BRANCH", "Retail banking branches and operations"),
        ]
        
        departments = []
        for name, code, desc in departments_data:
            dept, created = Department.objects.get_or_create(
                code=code,
                defaults={'name': name, 'description': desc, 'status': 'Active'}
            )
            departments.append(dept)
            if created:
                self.stdout.write(f"Department {code} created.")

        # 3. Seed Payment Plans
        plans_data = [
            ("One-Time Payment", 500.00, 0.00, 1),
            ("Two-Installment Plan", 500.00, 20.00, 2),
            ("Three-Installment Plan", 500.00, 25.00, 3),
        ]
        
        plans = []
        for name, base, penalty, count in plans_data:
            plan, created = PaymentPlan.objects.get_or_create(
                name=name,
                defaults={'base_amount': base, 'penalty_amount': penalty, 'installment_count': count, 'is_active': True}
            )
            plans.append(plan)
            if created:
                self.stdout.write(f"Payment Plan '{name}' created.")

        # 4. Seed Campaigns
        campaigns_data = [
            {
                'title': 'Ethiopian New Year Staff Lottery 2019',
                'holiday_name': 'Ethiopian New Year',
                'description': 'Official New Year lottery celebration for all Berhan Bank employees.',
                'draw_date': timezone.now() + datetime.timedelta(days=15),
                'registration_start_date': timezone.now() - datetime.timedelta(days=5),
                'registration_end_date': timezone.now() + datetime.timedelta(days=10),
                'telegram_link': 'https://t.me/berhan_bank_lottery_bot',
                'status': 'Active'
            },
            {
                'title': 'Easter Staff Lottery 2026',
                'holiday_name': 'Easter',
                'description': 'Easter holiday staff giveaway lottery.',
                'draw_date': timezone.now() + datetime.timedelta(days=60),
                'registration_start_date': timezone.now() + datetime.timedelta(days=20),
                'registration_end_date': timezone.now() + datetime.timedelta(days=55),
                'telegram_link': 'https://t.me/berhan_bank_lottery_bot',
                'status': 'Draft'
            },
            {
                'title': 'Staff Appreciation Day Lottery 2026',
                'holiday_name': 'Staff Appreciation',
                'description': 'Instant draw lottery celebrating staff performance. Draw starts today!',
                'draw_date': timezone.now() - datetime.timedelta(hours=1), # Draw date is past, draw is enabled!
                'registration_start_date': timezone.now() - datetime.timedelta(days=10),
                'registration_end_date': timezone.now() - datetime.timedelta(hours=2),
                'telegram_link': 'https://t.me/berhan_bank_lottery_bot',
                'status': 'Active'
            }
        ]

        seeded_campaigns = []
        for cdata in campaigns_data:
            camp, created = Campaign.objects.get_or_create(
                title=cdata['title'],
                defaults={
                    'holiday_name': cdata['holiday_name'],
                    'description': cdata['description'],
                    'draw_date': cdata['draw_date'],
                    'registration_start_date': cdata['registration_start_date'],
                    'registration_end_date': cdata['registration_end_date'],
                    'telegram_link': cdata['telegram_link'],
                    'status': cdata['status']
                }
            )
            seeded_campaigns.append(camp)
            if created:
                self.stdout.write(f"Campaign '{camp.title}' created.")

        # 5. Create Mock Registrations for active campaigns
        active_camp = seeded_campaigns[0]       # New Year (Active, Draw in future)
        appreciation_camp = seeded_campaigns[2] # Appreciation (Active, Draw date has passed)

        mock_users = [
            ("Abebe Kebede", "0911223344", departments[0], plans[0]), # IT, One-Time
            ("Almaz Tesfaye", "0922334455", departments[1], plans[1]), # HR, Two-Time
            ("Mulugeta Alemu", "0933445566", departments[2], plans[2]), # Finance, Three-Time
            ("Selamawit Girma", "0944556677", departments[0], plans[0]), # IT, One-Time
            ("Bekele Chala", "0955667788", departments[4], plans[2]), # Digital, Three-Time
        ]

        # Register to New Year Campaign
        for name, phone, dept, plan in mock_users:
            reg, created = Registration.objects.get_or_create(
                campaign=active_camp,
                phone_number=phone,
                defaults={'full_name': name, 'department': dept, 'payment_plan': plan}
            )
            if created:
                self.stdout.write(f"Registered {name} for New Year Campaign.")
                # For some users, approve their installments to make them eligible
                if name in ["Abebe Kebede", "Almaz Tesfaye"]:
                    for inst in reg.installments.all():
                        inst.status = 'Approved'
                        inst.save()
                    self.stdout.write(f"Approved all installments for {name} (Eligible).")

        # Register to Appreciation Campaign (Draw date passed, so users are ready for draw)
        for name, phone, dept, plan in mock_users[:4]:
            reg, created = Registration.objects.get_or_create(
                campaign=appreciation_camp,
                phone_number=phone,
                defaults={'full_name': name, 'department': dept, 'payment_plan': plan}
            )
            if created:
                self.stdout.write(f"Registered {name} for Appreciation Campaign.")
                # Approve all for Abebe, Almaz, Selamawit to make them eligible for drawing
                if name in ["Abebe Kebede", "Almaz Tesfaye", "Selamawit Girma"]:
                    for inst in reg.installments.all():
                        inst.status = 'Approved'
                        inst.save()

        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))
