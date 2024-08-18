from aim.permissions import IsCompanyActive
from company.models import Company
from company.serializers import CompanySerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from usercompanyrelation.models import UserCompanyRelation


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    authentication_classes = [JWTAuthentication]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["id"]

    def get_permissions(self):
        if self.action in ["retrieve", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsCompanyActive()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        return Company.objects.filter(usercompanyrelation__user=user)

    def perform_create(self, serializer):
        company = serializer.save()
        UserCompanyRelation.objects.create(
            user=self.request.user, company=company, role="Owner"
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        if not UserCompanyRelation.objects.filter(
            user=request.user, company=instance, role="Owner"
        ).exists():
            return Response(
                {"detail": "You don't have permission to update this company."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    partial_update = update
