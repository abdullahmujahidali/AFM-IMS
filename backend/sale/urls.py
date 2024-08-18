# urls.py

from rest_framework.routers import DefaultRouter
from sale.views import SaleViewSet

sales_router = DefaultRouter()
sales_router.register(r"sales", SaleViewSet, basename="sale")
