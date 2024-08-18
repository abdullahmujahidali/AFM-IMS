from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CustomerViewSet, OrderViewSet, TransactionViewSet

customer_router = DefaultRouter()
customer_router.register(r"customers", CustomerViewSet, basename="customer")
customer_router.register(r"orders", OrderViewSet, basename="order")
customer_router.register(r"transactions", TransactionViewSet, basename="transaction")
