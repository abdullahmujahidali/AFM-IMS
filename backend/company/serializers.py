from company.models import Company
from rest_framework import serializers


class CompanySerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ["id", "name", "status", "owner", "slug"]

    def get_owner(self, obj):
        from users.serializers import UserSerializer

        return UserSerializer(obj.owner).data
