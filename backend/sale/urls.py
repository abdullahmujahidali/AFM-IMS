# urls.py

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from sale.views import SaleViewSet

sales_router = DefaultRouter()
sales_router.register(r"sales", SaleViewSet)

urlpatterns = [
    path("", include(sales_router.urls)),
]
