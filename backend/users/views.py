from aim.permissions import IsCompanyActive, IsLoggedIn, IsOwnerOrAdmin
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
from usercompanyrelation.models import Role, UserCompanyRelation
from users.models import User
from users.serializers import UserCreateSerializer, UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["id", "company"]
    search_fields = ["first_name", "last_name", "email"]
    authentication_classes = [JWTAuthentication]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        elif self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsOwnerOrAdmin(), IsLoggedIn()]
        return [IsAuthenticated()]

    def perform_authentication(self, request):
        if self.action in ["create"]:
            return None
        else:
            return request.user

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return User.objects.filter(company=self.request.user.company)
        return User.objects.none()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        company_name = request.data.get("company_name")
        if company_name:
            slug = generate_unique_slug(company_name, Company)
            company = Company.objects.create(name=company_name, owner=user, slug=slug)
            user.company = company
            user.save()
            role = Role.objects.get(type="owner")
            print("user: ", role)
            UserCompanyRelation.objects.create(user=user, company=company, role=role)

        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAuthenticated],
    )
    def me(self, request):
        user = request.user
        serializer = self.get_serializer(user, context={"request": request})
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["patch"],
        permission_classes=[IsAuthenticated, IsOwnerOrAdmin],
    )
    def update_role(self, request, pk=None):
        user = self.get_object()
        new_role = request.data.get("role")

        if not new_role:
            return Response(
                {"error": "Role is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        relation = UserCompanyRelation.objects.filter(
            user=user, company=request.user.company
        ).first()
        if not relation:
            return Response(
                {"error": "User-Company relation not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        relation.role = new_role
        relation.save()
        return Response(
            {"message": "Role updated successfully"}, status=status.HTTP_200_OK
        )

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[IsAuthenticated, IsOwnerOrAdmin],
    )
    @transaction.atomic
    def invite_user(self, request):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        company = request.user.company
        if not company:
            return Response(
                {"error": "You are not associated with any company"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_user = serializer.save(company=company)

        UserCompanyRelation.objects.create(
            user=new_user,
            company=company,
            role="Member",
        )

        return Response(
            {"message": f"User {new_user.email} invited successfully"},
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    partial_update = update
