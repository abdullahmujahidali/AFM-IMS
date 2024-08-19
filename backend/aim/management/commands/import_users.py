import uuid

from company.models import Company
from django.core.management.base import BaseCommand
from usercompanyrelation.models import UserCompanyRelation
from users.models import User


class Command(BaseCommand):
    help = "Creates a superuser and a company"

    def handle(self, *args, **kwargs):
        user = User.objects.create(
            id=uuid.UUID("79aa29d8-0bda-492a-aee1-edfc5a675927"),
            first_name="Testing User",
            email="test@test.com",
            username="test@test.com",
            password="testpass123",
            is_active=True,
            is_superuser=True,
            is_staff=True,
        )
        user.set_password("testpass123")
        user.save()

        org = Company.objects.create(name="Microsoft", owner=user, status=True)
        UserCompanyRelation.objects.create(company=org, user=user, role="Owner")
        self.stdout.write(self.style.SUCCESS("Customers imported :)"))
