from uuid import uuid4

from aim.abstract_models import ID, Dates
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from .managers import CustomUserManager


class User(AbstractUser, ID, Dates):
    id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    email = models.EmailField(_("email address"), unique=True)
    username = models.CharField(blank=True, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email
