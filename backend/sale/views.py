from customer.models import Order, Transaction
from django.db.models import Prefetch
from rest_framework import status, viewsets
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

    def get_queryset(self):
        return Sale.objects.select_related('customer').prefetch_related(
            Prefetch('saleproduct_set', queryset=SaleProduct.objects.select_related('product'))
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        sale = serializer.instance

        # Create invoice for the sale
        for sale_product in sale.saleproduct_set.all():
            order = Order.objects.create(
                customer=sale.customer,
                product=sale_product.product,
                quantity=sale_product.quantity,
                total_price=sale_product.price * sale_product.quantity,
                status="PENDING",
            )
            Transaction.objects.create(
                customer=sale.customer,
                order=order,
                transaction_type="DEBIT",
                amount=order.total_price,
                status="UNPAID",
            )

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