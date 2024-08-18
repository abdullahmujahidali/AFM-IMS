from aim.abstract_models import ID, Dates, Name, TenantModel
from aim.validations import phone_validation
from company.manager import TenantManager
from django.db import models
from products.models import Product


class Customer(ID, Dates, Name):
    phone_number = models.CharField(max_length=15, validators=[phone_validation])
    balance = models.DecimalField(max_digits=10, default=0.0, decimal_places=2)
    company = models.ForeignKey("company.Company", on_delete=models.CASCADE)

    objects = TenantManager()

    @property
    def amount_owed(self):
        return abs(self.balance) if self.balance < 0 else 0

    def __str__(self):
        return f"{self.name} - {self.phone_number}"


class Order(ID, TenantModel, Dates):
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="orders"
    )
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

    def __str__(self):
        return f"Order {self.id} by {self.customer.name}"


class OrderItem(ID):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        if not self.price:
            self.price = self.product.price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in Order {self.order.id}"


class Transaction(ID, Dates, TenantModel):

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
