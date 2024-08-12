from customer.models import Order, OrderItem, Transaction
from django.db import transaction
from django.db.models import Prefetch
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import serializers, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from sale.models import Sale, SaleProduct

from .serializers import SaleSerializer


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["customer"]

    def get_queryset(self):
        return Sale.objects.select_related("customer").prefetch_related(
            Prefetch(
                "saleproduct_set",
                queryset=SaleProduct.objects.select_related("product"),
            )
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        sale = serializer.instance

        order = Order.objects.create(
            customer=sale.customer,
            total_price=sale.total_amount,
            status="PENDING",
        )

        # Create order items for each sale product
        for sale_product in sale.saleproduct_set.all():
            OrderItem.objects.create(
                order=order,
                product=sale_product.product,
                quantity=sale_product.quantity,
                price=sale_product.price,
            )

        Transaction.objects.create(
            customer=sale.customer,
            order=order,
            transaction_type="DEBIT",
            amount=order.total_price,
            status="UNPAID",
        )
        for sale_product in sale.saleproduct_set.all():
            product = sale_product.product
            product.stock_quantity -= sale_product.quantity
            if product.stock_quantity < 0:
                raise serializers.ValidationError(
                    f"Not enough stock_quantity for product {product.id}"
                )
            product.save()

        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Store related sale products before deleting the sale
        sale_products = instance.saleproduct_set.all()

        # Delete the sale instance
        self.perform_destroy(instance)

        # Revert stock_quantity and customer balance
        with transaction.atomic():
            for sale_product in sale_products:
                product = sale_product.product
                product.stock_quantity += sale_product.quantity
                product.save()

            customer = instance.customer
            customer.balance -= instance.total_amount
            customer.save()

        return Response(status=status.HTTP_204_NO_CONTENT)
