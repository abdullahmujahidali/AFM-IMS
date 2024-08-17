from company.models import Company
from rest_framework import serializers
from users.serializers import UserSerializer


class CompanySerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Company
        fields = ["id", "name", "status", "owner", "slug"]
