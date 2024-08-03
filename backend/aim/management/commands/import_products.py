import json
import os

from django.conf import settings
from django.core.management.base import BaseCommand
from products.models import Product


class Command(BaseCommand):
    help = "Import products from a JSON file into the Product model"

    def handle(self, *args, **kwargs):
        json_file_path = os.path.join(settings.BASE_DIR, "aim/data/products.json")

        if not os.path.exists(json_file_path):
            self.stderr.write(f"File not found: {json_file_path}")
            return

        with open(json_file_path, "r") as file:
            data = json.load(file)

        for item in data:
            Product.objects.update_or_create(
                name=item["name"],
                defaults={
                    "price": item.get("price", 0.0),
                    "product_type": item.get("product_type", "FRAME"),
                    "dimensions": item.get("dimensions", "Not specified"),
                    "size": item.get("size", "Not specified"),
                    "description": item.get("description", ""),
                },
            )

        self.stdout.write(self.style.SUCCESS("Products imported successfully."))
