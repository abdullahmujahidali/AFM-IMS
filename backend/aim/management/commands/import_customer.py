import json
import os

from company.models import Company
from customer.models import Customer
from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Import products from a JSON file into the Customer model"

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, "aim/data/customers.json")

        if not os.path.exists(file_path):
            self.stderr.write(f"File not found: {file_path}")
            return

        with open(file_path, "r") as file:
            data = json.load(file)
        company = Company.objects.all().first()
        for item in data:
            Customer.objects.update_or_create(
                name=item["name"],
                company=company,
                defaults={
                    "phone_number": item.get("phone_number"),
                    "balance": item.get("balance"),
                },
            )

        self.stdout.write(self.style.SUCCESS("Customers imported :)"))
