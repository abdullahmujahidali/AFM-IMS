from products.models import Product
from rest_framework import serializers


class CompanyModelSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        validated_data["company"] = self.context["request"].company
        return super().create(validated_data)


class ProductSerializer(CompanyModelSerializer):
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
