# Generated by Django 5.0.7 on 2024-08-19 08:17

import django.db.models.deletion
import django.utils.timezone
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("company", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Product",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("modified_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=255)),
                (
                    "price",
                    models.DecimalField(decimal_places=2, default=0.0, max_digits=10),
                ),
                (
                    "product_type",
                    models.CharField(
                        choices=[
                            ("TRUNK", "Trunk Frame"),
                            ("DRUM", "Drum Frame"),
                            ("COOLER", "Cooler Frame"),
                            ("RING", "Ring Frame"),
                            ("ANGLE", "Angle"),
                        ],
                        default="FRAME",
                        max_length=20,
                    ),
                ),
                (
                    "dimensions",
                    models.CharField(
                        default="Not specified",
                        help_text="Dimensions of the product",
                        max_length=50,
                    ),
                ),
                ("stock_quantity", models.IntegerField(default=0)),
                (
                    "size",
                    models.CharField(
                        default="Not specified",
                        help_text="Size of the product",
                        max_length=50,
                    ),
                ),
                ("description", models.TextField()),
                (
                    "company",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(class)s",
                        to="company.company",
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
    ]
