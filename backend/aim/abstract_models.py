from uuid import uuid4

from aim.validations import order_validation
from django.db import models
from django.utils import timezone


class ID(models.Model):

    id = models.UUIDField(primary_key=True, editable=False, default=uuid4)

    class Meta:
        abstract = True


class Dates(models.Model):
    """A base class for date and time that keeps the time of creation and \
        modification for objects of classes that inherit it."""

    created_at = models.DateTimeField(default=timezone.now)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Ordering(models.Model):
    """An abstract model class that is used where the order of \
        objects is important."""

    order = models.PositiveIntegerField(validators=[order_validation])

    class Meta:
        abstract = True


class Name(models.Model):
    """A class that stores the name for the classes that inherit it."""

    name = models.CharField(max_length=255)

    class Meta:
        abstract = True


class CompanyAwareModel(models.Model):
    """This abstract class is inherited in all other models who create a FK relation with Company model."""

    company = models.ForeignKey(
        to="company.Company", related_name="%(class)s", on_delete=models.CASCADE
    )

    class Meta:
        abstract = True


class UserAwareModel(models.Model):
    """
    This is an abstract class which contains a foreign key to the
    BaseUser table.
    """

    user = models.ForeignKey(
        to="users.User", on_delete=models.CASCADE, related_name="%(class)s"
    )

    class Meta:
        abstract = True


class RoleAwareModel(models.Model):
    """This abstract model adds a foreign key to the inheritee model."""

    role = models.ForeignKey(
        to="usercompanyrelation.Role",
        to_field="type",
        on_delete=models.CASCADE,
        related_name="%(class)s",
    )

    class Meta:
        abstract = True
