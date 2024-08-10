import json
import os

from customer.models import Customer
from django.conf import settings
from django.core.management.base import BaseCommand
from products.models import Product


class Command(BaseCommand):
    help = "Import products from a JSON file into the Customer model"

    def handle(self, *args, **kwargs):
        json_file_path = os.path.join(settings.BASE_DIR, "aim/data/customers.json")

        if not os.path.exists(json_file_path):
            self.stderr.write(f"File not found: {json_file_path}")
            return

        with open(json_file_path, "r") as file:
            data = json.load(file)

        for item in data:
            Customer.objects.update_or_create(
                name=item["name"],
                defaults={
                    "phone_number": item.get("phone_number"),
                    "balance": item.get("balance"),
                },
            )

        self.stdout.write(self.style.SUCCESS("Customers imported successfully."))
