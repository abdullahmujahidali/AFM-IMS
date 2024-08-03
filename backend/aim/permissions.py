from rest_framework.permissions import BasePermission


class IsCompanyActive(BasePermission):
    """
    Custom permission to only allow access if the company's status is True.
    """

    def has_permission(self, request, view):
        # Get the user from the request
        user = request.user

        # Check if the user has an associated company
        if hasattr(user, "company"):
            # Check if the company's status is True
            return user.company.status

        # If no company is associated, deny access
        return False
