from products.models import Product
from rest_framework import serializers

from .models import Customer, Order, Transaction


class CustomerSerializer(serializers.ModelSerializer):
    amount_owed = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Customer
        fields = [
            "id",
            "amount_owed",
            "created_at",
            "modified_at",
            "name",
            "phone_number",
            "balance",
        ]


class CustomerListSerializer(serializers.ListSerializer):
    total_amount_owed = serializers.SerializerMethodField()

    def get_total_amount_owed(self, obj):
        return sum(customer.amount_owed for customer in obj)

    def to_representation(self, data):
        representation = super().to_representation(data)
        total_amount_owed = self.get_total_amount_owed(data)
        return {
            "total_amount_owed": total_amount_owed,
            "results": representation,
        }

    class Meta:
        model = Customer
        fields = ["total_amount_owed", "results"]


class OrderSerializer(serializers.ModelSerializer):

    class Meta:
        model = Order
        fields = "__all__"

    def create(self, validated_data):
        product = validated_data.pop("product")
        customer = validated_data.pop("customer")
        product = Product.objects.get(id=product.id)
        customer = Customer.objects.get(id=customer.id)

        order = Order.objects.create(
            product=product, customer=customer, **validated_data
        )
        return order


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"
