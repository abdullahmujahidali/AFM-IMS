from customer.serializers import (
    CustomerSerializer,
    OrderSerializer,
    TransactionSerializer,
)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Customer, Order, Transaction


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    authentication_classes = [JWTAuthentication]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["id"]

    def get_permissions(self):
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        # Calculate the total amount owed
        total_amount_owed = sum(
            customer.amount_owed for customer in self.get_queryset()
        )

        # Add the total amount owed and count to the response data
        response.data = {
            "count": response.data["count"],  # Add the count back to the response
            "total_amount_owed": total_amount_owed,
            "results": response.data["results"],
        }

        return response


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["customer"]

    def get_queryset(self):
        queryset = super().get_queryset()
        customer_id = self.request.query_params.get("customer", None)
        if customer_id:
            queryset = queryset.filter(customer=customer_id)
        return queryset

    def perform_create(self, serializer):
        order = serializer.save()
        total_price = sum(item.price for item in order.items.all())
        order.total_price = total_price
        order.save()

    def perform_update(self, serializer):
        order = serializer.save()
        total_price = sum(item.price for item in order.items.all())
        order.total_price = total_price
        order.save()


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["customer", "order"]
