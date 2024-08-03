from rest_framework import serializers
from usercompanyrelation.models import UserCompanyRelation


class UserCompanyRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCompanyRelation
        fields = ["id", "user", "company", "role"]
