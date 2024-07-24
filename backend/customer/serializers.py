from rest_framework import serializers

from products.serializers import ProductSerializer

from .models import Customer, Order, Transaction


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"


class OrderSerializer(serializers.ModelSerializer):
    product = ProductSerializer()
    customer = CustomerSerializer()

    class Meta:
        model = Order
        fields = "__all__"


class TransactionSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer()
    order = OrderSerializer()

    class Meta:
        model = Transaction
        fields = "__all__"
