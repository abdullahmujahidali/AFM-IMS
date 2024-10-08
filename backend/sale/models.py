# sale/models.py

from aim.abstract_models import ID, CompanyAwareModel, Dates
from customer.models import Customer
from django.db import models
from products.models import Product


class Sale(ID, CompanyAwareModel, Dates):
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="sales"
    )
    products = models.ManyToManyField(Product, through="SaleProduct")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    comments = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Sale {self.id} by {self.customer.name}"


class SaleProduct(ID, CompanyAwareModel, Dates):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
