from aim.permissions import IsCompanyActive
from aim.utils import generate_unique_slug
from company.models import Company
from company.serializers import CompanySerializer
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from usercompanyrelation.models import UserCompanyRelation
from users.models import User
from users.serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["id", "company"]
    search_fields = ["first_name", "last_name", "email"]
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAuthenticated()]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        user_serializer = self.get_serializer(data=request.data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        company_data = request.data.get("company_name")
        if company_data:
            slug = generate_unique_slug(company_data, Company)
            company = Company.objects.create(name=company_data, owner=user, slug=slug)
            user.company = company
            user.save()
            UserCompanyRelation.objects.create(user=user, company=company, role="Owner")

        headers = self.get_success_headers(user_serializer.data)
        return Response(
            user_serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAuthenticated, IsCompanyActive],
    )
    def me(self, request):
        """
        Retrieve the details of the currently logged-in user along with company details.
        """
        user = request.user
        user_serializer = self.get_serializer(user)
        user_data = user_serializer.data
        if user.company:
            company_serializer = CompanySerializer(user.company)
            user_data["company"] = company_serializer.data

        return Response(user_data)

    @action(detail=True, methods=["patch"])
    def update_role(self, request, pk=None):
        user = self.get_object()
        new_role = request.data.get("role")

        if not new_role:
            return Response(
                {"error": "Role is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            relation = UserCompanyRelation.objects.get(
                user=user, company=request.user.company
            )
            relation.role = new_role
            relation.save()
            return Response(
                {"message": "Role updated successfully"}, status=status.HTTP_200_OK
            )
        except UserCompanyRelation.DoesNotExist:
            return Response(
                {"error": "User-Company relation not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=False, methods=["post"])
    @transaction.atomic
    def invite_user(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Get the company instance using the provided UUID
        company_id = request.data.get("company")
        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return Response(
                {"error": "Invalid company ID"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Create the new user
        new_user = serializer.save(company=company)
        new_user.company = company
        new_user.save()
        print("company: ", company)
        print("dsfds: ", new_user.company)

        # Create UserCompanyRelation
        UserCompanyRelation.objects.create(
            user=new_user,
            company=company,
            role="Member",
        )

        return Response(
            {"message": f"User {new_user.email} invited successfully"},
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
