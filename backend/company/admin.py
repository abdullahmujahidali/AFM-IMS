from django.contrib import admin

from .models import Company


class CompanyAdmin(admin.ModelAdmin):
    list_display = (
        "slug",
        "id",
        "name",
        "owner",
        "status",
        "created_at",
    )
    search_fields = ("name", "slug", "owner__email")
    list_filter = ("status", "created_at", "modified_at")
    readonly_fields = ("slug", "created_at", "modified_at", "id")


admin.site.register(Company, CompanyAdmin)
