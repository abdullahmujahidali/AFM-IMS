from products.models import Product
from rest_framework import serializers


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "price",
            "product_type",
            "dimensions",
            "stock_quantity",
            "size",
            "description",
        ]
