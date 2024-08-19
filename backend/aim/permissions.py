from rest_framework.permissions import BasePermission
from usercompanyrelation.models import UserCompanyRelation
from users.models import User


class IsCompanyActive(BasePermission):
    """
    Custom permission to only allow access if the company's status is True.
    """

    def has_permission(self, request, view):
        user = request.user
        if hasattr(user, "company"):
            return user.company.status
        return False


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        if isinstance(obj, User):
            return obj == request.user
        return False


class IsLoggedIn(BasePermission):
    """This permission class is used to check whether the authenticated
    user is logged in a company or not."""

    def has_permission(self, request, view):
        """Overriding this method to implement how permissions
        are going to be determined."""
        try:
            user = User.objects.get(email=request.user.email)
            print("user is here: ", user)
            relation = UserCompanyRelation.objects.select_related("company").get(
                user=user
            )
            print("relation: ", relation.company)
            request.li_relation = relation
            request.company = relation.company
            return True
        except UserCompanyRelation.DoesNotExist:
            return False
