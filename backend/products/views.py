from aim.mixins import IsAdminPermissionMixin
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from products.models import Product
from products.serializers import ProductSerializer
from rest_framework import viewsets
from rest_framework.response import Response


class ProductViewSet(IsAdminPermissionMixin, viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["id"]

    def get_object(self):
        item = self.kwargs.get("pk")
        return get_object_or_404(Product, pk=item, company=self.request.company)

    def list(self, request, *args, **kwargs):
        queryset = Product.objects.filter(company=request.company)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)

        return Response(
            {
                "count": queryset.count(),
                "results": serializer.data,
            }
        )

    def perform_create(self, serializer):
        serializer.save(company=self.request.company)
