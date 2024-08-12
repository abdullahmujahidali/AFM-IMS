from products.models import Product
from rest_framework import serializers

from .models import Customer, Order, OrderItem, Transaction


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


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["product", "quantity", "price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ["id", "customer", "total_price", "status", "items", "created_at"]

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items")
        instance = super().update(instance, validated_data)

        # Update or create order items
        existing_items = instance.items.all()
        for item_data in items_data:
            item = existing_items.filter(product=item_data["product"]).first()
            if item:
                for attr, value in item_data.items():
                    setattr(item, attr, value)
                item.save()
            else:
                OrderItem.objects.create(order=instance, **item_data)

        # Remove items not in the updated data
        existing_items.exclude(
            product__in=[item["product"] for item in items_data]
        ).delete()

        return instance


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"
