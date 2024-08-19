# usercompanyrelation/models.py


from aim.abstract_models import (
    ID,
    CompanyAwareModel,
    Dates,
    RoleAwareModel,
    UserAwareModel,
)
from bulk_update_or_create import BulkUpdateOrCreateQuerySet
from django.db import models
from django.utils.translation import gettext_lazy as _
from usercompanyrelation.manager import UserCompanyRelationManager


class RoleManager(BulkUpdateOrCreateQuerySet):
    """Custom manager for Role model. It helps get all the roles separately."""

    def get_admin(self):
        """Get the admin role."""
        return self.get(type="admin")

    def get_member(self):
        """Get the member role."""
        return self.get(type="member")

    def get_finance(self):
        """Get the finance role."""
        return self.get(type="finance")

    def get_owner(self):
        """Get the owner role."""
        return self.get(type="owner")


class RoleChoices(models.TextChoices):
    """Allowed roles in a company."""

    ADMIN = "admin", _("admin")
    MEMBER = "member", _("member")
    OWNER = "owner", _("owner")
    FINANCE = "finance", _("finance")


class Role(Dates, ID):
    """Django model for the Role of a user in each company."""

    type = models.CharField(max_length=10, choices=RoleChoices.choices, unique=True)

    objects = RoleManager.as_manager()

    class Meta:
        db_table = "role"

    def __str__(self):
        return f"{self.type}"


class UserCompanyRelation(CompanyAwareModel, UserAwareModel, RoleAwareModel, Dates, ID):
    """Django M2M model for User and Company models. It saves multiple attributes which emerge or are needed from the\
    relation of User and Company."""

    objects = UserCompanyRelationManager.as_manager()

    class Meta:
        db_table = "user_company_relation"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "company"], name="user_in_company_unique"
            )
        ]

    def __str__(self):
        return f"{self.role.type} {self.user.first_name} {self.company.name}"
