from django.db import models

from aim.abstract_models import ID, Dates, Name


class Product(ID, Dates, Name):
    price = models.DecimalField(default=0.0, max_digits=5, decimal_places=2)
    product_type = models.CharField(
        max_length=20,
        choices=[
            ("TRUNK", "Trunk Frame"),
            ("DRUM", "Drum Frame"),
            ("COOLER", "Cooler Frame"),
            ("RING", "Ring Frame"),
            ("ANGLE", "Angle"),
        ],
        default="FRAME",
    )
    dimensions = models.CharField(
        max_length=50, default="Not specified", help_text="Dimensions of the product"
    )
    size = models.CharField(
        max_length=50, default="Not specified", help_text="Size of the product"
    )
    description = models.TextField()

    def __str__(self):
        return self.name
