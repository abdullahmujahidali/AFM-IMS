from django.contrib import admin

from .models import Sale, SaleProduct


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer_name",
        "total_amount",
        "created_at",
        "comments",
    )
    list_filter = ("created_at",)
    search_fields = ("customer__name", "comments")
    readonly_fields = ("total_amount",)

    def customer_name(self, obj):
        return obj.customer.name

    customer_name.short_description = "Customer"


@admin.register(SaleProduct)
class SaleProductAdmin(admin.ModelAdmin):
    list_display = (
        "sale_id",
        "product_name",
        "quantity",
        "price",
    )
    search_fields = ("sale__id", "product__name")

    def sale_id(self, obj):
        return obj.sale.id

    sale_id.short_description = "Sale"

    def product_name(self, obj):
        return obj.product.name

    product_name.short_description = "Product"
