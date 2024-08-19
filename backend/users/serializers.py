import logging

from company.models import Company
from rest_framework import serializers
from usercompanyrelation.models import UserCompanyRelation
from users.models import User

logger = logging.getLogger(__name__)


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    company = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "company",
            "first_name",
            "last_name",
            "is_staff",
            "phone_number",
            "role",
        ]
        read_only_fields = ["is_staff"]

    def get_role(self, obj):
        user_tenant_relation = UserCompanyRelation.objects.get(user=obj)
        return user_tenant_relation.role

    def get_company(self, obj):
        company_object = Company.objects.get(owner=obj)
        comp = {
            "slug": company_object.slug,
            "status": company_object.status,
            "name": company_object.name,
        }
        return comp

    def update(self, instance, validated_data):
        if "password" in validated_data:
            instance.set_password(validated_data.pop("password"))
        return super().update(instance, validated_data)


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    company_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "first_name",
            "last_name",
            "phone_number",
            "company_name",
        ]

    def create(self, validated_data):
        company_name = validated_data.pop("company_name", None)
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            phone_number=validated_data.get("phone_number", ""),
        )
        return user
