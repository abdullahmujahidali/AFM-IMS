from aim.mixins import IsAdminPermissionMixin
from aim.permissions import IsCompanyActive, IsLoggedIn
from customer.models import Customer, Order, Transaction
from customer.serializers import (
    CustomerSerializer,
    OrderSerializer,
    TransactionSerializer,
)
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication


class CustomerViewSet(IsAdminPermissionMixin, viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["id"]

    def get_object(self):
        item = self.kwargs.get("pk")
        return get_object_or_404(Customer, pk=item, company=self.request.company)

    def list(self, request, *args, **kwargs):
        queryset = Customer.objects.filter(company=request.company)
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
        serializer.save(company=self.request.company)


class OrderViewSet(IsAdminPermissionMixin, viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["customer"]

    def get_queryset(self):
        return Order.objects.filter(customer__company=self.request.company)

    def get_object(self, request, *args, **kwargs):
        print("request: ", request)
        item = self.kwargs.get("pk")
        return get_object_or_404(Order, request, pk=item)

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
        return Transaction.objects.filter(customer__company=self.request.company)
