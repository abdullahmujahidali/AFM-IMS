# serializers.py

from rest_framework import serializers

from .models import Sale, SaleProduct


class SaleProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleProduct
        fields = ["product", "quantity", "price"]


class SaleSerializer(serializers.ModelSerializer):
    products = SaleProductSerializer(many=True)
    comments = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Sale
        fields = [
            "id",
            "customer",
            "products",
            "total_amount",
            "comments",
            "created_at",
        ]

    def create(self, validated_data):
        products_data = validated_data.pop("products")
        sale = Sale.objects.create(**validated_data)
        for product_data in products_data:
            SaleProduct.objects.create(sale=sale, **product_data)
        return sale
