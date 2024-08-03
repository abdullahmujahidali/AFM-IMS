from django.contrib import admin
from django.utils.html import format_html

from .models import Customer, Order, Transaction

# Register your models here.


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "phone_number", "created_at")
    search_fields = ("name", "phone_number")
    list_filter = ("created_at",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer_name",
        "product_name",
        "quantity",
        "total_price",
        "status",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("customer__name", "product__name")
    readonly_fields = ("total_price",)

    def customer_name(self, obj):
        return obj.customer.name

    customer_name.short_description = "Customer"

    def product_name(self, obj):
        return obj.product.name

    product_name.short_description = "Product"

    def status_color(self, obj):
        colors = {
            "PENDING": "orange",
            "PROCESSING": "blue",
            "SHIPPED": "purple",
            "DELIVERED": "green",
            "CANCELLED": "red",
        }
        return format_html(
            '<span style="color: {};">{}</span>',
            colors.get(obj.status, "black"),
            obj.get_status_display(),
        )

    status_color.short_description = "Status"

    list_display = (
        "id",
        "customer_name",
        "product_name",
        "quantity",
        "total_price",
        "status_color",
        "created_at",
    )


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        "customer_name",
        "order_id",
        "transaction_type",
        "amount",
        "status",
        "created_at",
    )
    list_filter = ("transaction_type", "status", "created_at")
    search_fields = ("customer__name", "order__id", "status")
    readonly_fields = ("amount",)

    def customer_name(self, obj):
        return obj.customer.name

    customer_name.short_description = "Customer"

    def order_id(self, obj):
        return obj.order.id

    order_id.short_description = "Order"

    def status_color(self, obj):
        colors = {
            "Paid": "green",
            "Partially Paid": "orange",
            "Unpaid": "red",
        }
        return format_html(
            '<span style="color: {};">{}</span>',
            colors.get(obj.status, "black"),
            obj.get_status_display(),
        )

    status_color.short_description = "Status"

    list_display = (
        "customer_name",
        "order_id",
        "transaction_type",
        "amount",
        "status_color",
        "created_at",
    )
