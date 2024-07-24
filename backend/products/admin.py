from django.contrib import admin

from products.models import Product


# Register your models here.
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "created_at", "product_type")
    list_filter = ("created_at",)
    search_fields = ("name", "description")
