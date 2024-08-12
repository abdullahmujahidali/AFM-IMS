from django_filters.rest_framework import DjangoFilterBackend
from products.models import Product
from products.serializers import ProductSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    authentication_classes = [JWTAuthentication]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["id"]

    def get_permissions(self):
        return [IsAuthenticated()]
