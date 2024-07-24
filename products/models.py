from django.db import models

from aim.abstract_models import ID, Dates, Name


class Product(ID, Dates, Name):
    price = models.DecimalField(default=0.0, max_digits=5, decimal_places=2)
    description = models.TextField()
