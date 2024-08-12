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
        fields = ["id", "name", "price"]


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
    paying_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    class Meta:
        model = Sale
        fields = [
            "id",
            "customer",
            "customer_id",
            "items",
            "total_amount",
            "comments",
            "paying_amount",
            "balance",
            "created_at",
        ]

    def create(self, validated_data):
        products_data = validated_data.pop("saleproduct_set")
        paying_amount = Decimal(validated_data.pop("paying_amount"))
        balance = Decimal(validated_data.pop("balance"))

        customer = validated_data["customer"]
        total_amount = Decimal(validated_data.pop("total_amount"))

        calculated_total = sum(
            Decimal(product["price"]) * product["quantity"] for product in products_data
        )

        if abs(total_amount - calculated_total) > Decimal("0.01"):
            raise serializers.ValidationError("Total amount mismatch")

        new_balance = customer.balance + (paying_amount - total_amount)

        if abs(new_balance - balance) > Decimal("0.01"):
            raise serializers.ValidationError("Balance mismatch")

        customer.balance = new_balance
        customer.save()

        sale = Sale.objects.create(**validated_data, total_amount=total_amount)

        for product_data in products_data:
            SaleProduct.objects.create(sale=sale, **product_data)

        return sale

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["balance"] = instance.customer.balance
        return representation
