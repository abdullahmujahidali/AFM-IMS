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
