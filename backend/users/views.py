from aim.permissions import IsCompanyActive
from aim.utils import generate_unique_slug
from company.models import Company
from company.serializers import CompanySerializer
from django.db import transaction
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
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAuthenticated()]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        # First, create the user
        user_serializer = self.get_serializer(data=request.data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        # Then, create the company
        company_data = request.data.get("company_name")
        if company_data:
            slug = generate_unique_slug(company_data, Company)
            company = Company.objects.create(name=company_data, owner=user, slug=slug)

            user.company = company
            user.save()

            # Finally, create the UserCompanyRelation
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

        # Add company data to the response
        if user.company:
            company_serializer = CompanySerializer(user.company)
            user_data["company"] = company_serializer.data

        return Response(user_data)
