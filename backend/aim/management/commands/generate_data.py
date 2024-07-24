# Standard Library
import uuid

# Django
from django.core.management.base import BaseCommand
from django.db import transaction

# 3rd Party Libraries
from user.models import User


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        if User.objects.all().exists():
            return

        with transaction.atomic():
            User.objects.create_superuser(
                id=uuid.uuid4(),
                first_name="Django Admin User",
                username="test@test.com",
                email="test@test.com",
                password="testpass123",
            )

            user = User.objects.create(
                id=uuid.UUID("79aa29d8-0bda-492a-aee1-edfc5a675927"),
                first_name="Testing User",
                email="test@test.com",
                username="test@test.com",
                password="testpass123",
                is_owner=True,
            )
            user.set_password("testpass123")
            user.save()
