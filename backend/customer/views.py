from aim.permissions import IsCompanyActive
from customer.models import Customer, Order, Transaction
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


class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    authentication_classes = [JWTAuthentication]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["id"]

    def get_queryset(self):
        return Customer.objects.filter(company=self.request.company)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        total_amount_owed = sum(customer.amount_owed for customer in queryset)

        return Response(
            {
                "count": queryset.count(),
                "total_amount_owed": total_amount_owed,
                "results": serializer.data,
            }
        )

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class OrderViewSet(viewsets.ModelViewSet):
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
    serializer_class = TransactionSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["customer", "order"]

    def get_queryset(self):
        queryset = super().get_queryset()
        customer_id = self.request.query_params.get("customer", None)
        if customer_id:
            queryset = queryset.filter(customer=customer_id)
        return queryset
