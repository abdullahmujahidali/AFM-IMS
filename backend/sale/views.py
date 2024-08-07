# views.py

from customer.models import Order, Transaction
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from sale.models import Sale

from .serializers import SaleSerializer


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

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
