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
            # Check if the company's status is True
            return user.company.status

        # If no company is associated, deny access
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
            relation = UserCompanyRelation.objects.select_related(
                "role", "company"
            ).get(user=user)
        except UserCompanyRelation.DoesNotExist:
            return False
        request.li_relation = relation
        request.company = relation.company
        request.role = relation.role
        return True
