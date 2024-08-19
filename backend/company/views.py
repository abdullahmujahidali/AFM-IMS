# DRF
# 3rd Party Libraries
from company.models import Company
from company.serializers import CompanySerializer
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class CompanyViewSet(IsAuthenticated, viewsets.ModelViewSet):

    serializer_class = CompanySerializer

    queryset = Company.objects.all()

    def list(self, request, pk=None):
        queryset = Company.objects.get(id=request.company.id)
        serializer = CompanySerializer(queryset)
        return Response(serializer.data)

    def update(self, request, pk=None):
        device = self.get_object(pk)
        serializer = CompanySerializer(device, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
