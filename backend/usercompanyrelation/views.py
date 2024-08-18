from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from users.models import User
from usercompanyrelation.models import UserCompanyRelation
from usercompanyrelation.serializers import UserCompanyRelationSerializer


class InviteViewSet(viewsets.ViewSet):
    """
    API endpoint for managing user invitations and role assignments.
    """

    def create(self, request, *args, **kwargs):
        # Invite a user
        # Implementation logic to invite a user
        # user = User.object.get()
        print("request: ", request.data)
        pass

    def update(self, request, *args, **kwargs):
        # Update an invite (change role)
        invite_id = kwargs.get("pk")
        invite = UserCompanyRelation.objects.get(id=invite_id)
        serializer = UserCompanyRelationSerializer(
            invite, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        # Cancel an invite
        invite_id = kwargs.get("pk")
        invite = UserCompanyRelation.objects.get(id=invite_id)
        invite.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
