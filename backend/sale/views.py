from decimal import Decimal

from customer.models import Order, OrderItem, Transaction
from django.db import transaction
from django.db.models import Prefetch
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import serializers
from rest_framework import status
from rest_framework import status as drf_status
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from sale.models import Sale, SaleProduct
from sale.serializers import SaleSerializer


class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["customer"]

    def get_queryset(self):
        return (
            Sale.objects.filter(customer__company=self.request.user.company)
            .select_related("customer")
            .prefetch_related(
                Prefetch(
                    "saleproduct_set",
                    queryset=SaleProduct.objects.filter(
                        product__company=self.request.user.company
                    ).select_related("product"),
                )
            )
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                sale = serializer.save()
                order = Order.objects.create(
                    customer=sale.customer,
                    total_price=sale.total_amount,
                    status="PENDING",
                )

                for sale_product in sale.saleproduct_set.all():
                    OrderItem.objects.create(
                        order=order,
                        product=sale_product.product,
                        quantity=sale_product.quantity,
                        price=sale_product.price,
                    )

                    product = sale_product.product
                    if product.stock_quantity < sale_product.quantity:
                        raise serializers.ValidationError(
                            f"Not enough stock for product {product.name}. Available: {product.stock_quantity}"
                        )
                    product.stock_quantity -= sale_product.quantity
                    product.save()

                amount_paid = Decimal(sale.amount_paid)
                total_amount = sale.total_amount

                if amount_paid == 0:
                    transaction_status = "UNPAID"
                elif amount_paid >= total_amount:
                    transaction_status = "PAID"
                else:
                    transaction_status = "PARTIALLY_PAID"

                Transaction.objects.create(
                    customer=sale.customer,
                    order=order,
                    transaction_type="DEBIT",
                    amount=total_amount,
                    status=transaction_status,
                )

        except serializers.ValidationError as e:
            return Response({"detail": str(e)}, status=drf_status.HTTP_400_BAD_REQUEST)

        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=drf_status.HTTP_201_CREATED, headers=headers
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
        sale_products = instance.saleproduct_set.all()

        self.perform_destroy(instance)

        with transaction.atomic():
            for sale_product in sale_products:
                product = sale_product.product
                product.stock_quantity += sale_product.quantity
                product.save()

            customer = instance.customer
            customer.balance -= instance.total_amount
            customer.save()

        return Response(status=status.HTTP_204_NO_CONTENT)
