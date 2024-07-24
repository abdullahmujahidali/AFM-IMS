from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CustomerViewSet, OrderViewSet, TransactionViewSet

customer_router = DefaultRouter()
customer_router.register(r"customers", CustomerViewSet)
customer_router.register(r"orders", OrderViewSet)
customer_router.register(r"transactions", TransactionViewSet)

urlpatterns = [
    path("", include(customer_router.urls)),
]
