from decimal import Decimal

from customer.models import Customer
from products.models import Product
from rest_framework import serializers

from .models import Sale, SaleProduct


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class SaleProductSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source="product", write_only=True
    )

    class Meta:
        model = SaleProduct
        fields = ["product", "product_id", "quantity", "price"]


class SaleSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), source="customer", write_only=True
    )
    items = SaleProductSerializer(many=True, source="saleproduct_set")
    amount_paid = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )
    balance = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, read_only=True
    )

    class Meta:
        model = Sale
        fields = [
            "id",
            "customer",
            "customer_id",
            "items",
            "total_amount",
            "amount_paid",
            "balance",
            "comments",
            "created_at",
        ]

    def create(self, validated_data):
        products_data = validated_data.pop("saleproduct_set")
        amount_paid = Decimal(validated_data.pop("amount_paid", 0))

        customer = validated_data["customer"]
        total_amount = Decimal(validated_data.pop("total_amount"))

        calculated_total = sum(
            Decimal(product["price"]) * product["quantity"] for product in products_data
        )

        if abs(total_amount - calculated_total) > Decimal("0.01"):
            raise serializers.ValidationError("Total amount mismatch")

        new_balance = customer.balance - (total_amount - amount_paid)
        customer.balance = new_balance
        customer.save()

        sale = Sale.objects.create(
            **validated_data, total_amount=total_amount, amount_paid=amount_paid
        )

        for product_data in products_data:
            SaleProduct.objects.create(sale=sale, **product_data)

        return sale

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["balance"] = instance.customer.balance
        return representation
