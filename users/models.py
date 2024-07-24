from uuid import uuid4

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from aim.abstract_models import ID, Dates
from aim.validations import phone_validation

from .managers import CustomUserManager


class User(AbstractUser, ID, Dates):
    id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    email = models.EmailField(_("email address"), unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email


class Customer(ID, Dates):
    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15, validators=[phone_validation])


class Product(ID, Dates):
    name = models.CharField(max_length=255)
