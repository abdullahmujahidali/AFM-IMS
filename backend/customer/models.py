from aim.abstract_models import ID, Dates, Name
from aim.validations import phone_validation
from django.db import models
from products.models import Product


class Customer(ID, Dates, Name):
    phone_number = models.CharField(max_length=15, validators=[phone_validation])


class Order(ID, Dates):
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="orders"
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="orders"
    )
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=[
            ("PENDING", "Pending"),
            ("PROCESSING", "Processing"),
            ("SHIPPED", "Shipped"),
            ("DELIVERED", "Delivered"),
            ("CANCELLED", "Cancelled"),
        ],
        default="PENDING",
    )

    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.product.price * self.quantity
        super().save(*args, **kwargs)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order {self.id} by {self.customer.name} for {self.product.name}"


class Transaction(ID, Dates):

    TRANSACTION_TYPE_CHOICES = [
        ("DEBIT", "Debit"),
        ("CREDIT", "Credit"),
    ]

    STATUS_CHOICES = [
        ("PAID", "Paid"),
        ("PARTIALLY_PAID", "Partially Paid"),
        ("UNPAID", "Unpaid"),
    ]

    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="transactions"
    )
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="transactions"
    )
    transaction_type = models.CharField(
        max_length=10,
        choices=TRANSACTION_TYPE_CHOICES,
        default="DEBIT",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="UNPAID",
    )

    def __str__(self):
        return f"{self.customer.name} - Order {self.order.id} - {self.amount} - {self.status}"

    class Meta:
        ordering = ["-modified_at"]
