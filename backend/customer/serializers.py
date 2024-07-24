from products.models import Product
from products.serializers import ProductSerializer
from rest_framework import serializers

from .models import Customer, Order, Transaction


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"


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
