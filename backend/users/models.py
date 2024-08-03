# users/models.py

from uuid import uuid4

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from .managers import CustomUserManager


class User(AbstractUser):
    id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    email = models.EmailField(_("email address"), unique=True)
    username = models.CharField(blank=True, null=True)
    company = models.ForeignKey(
        "company.Company",
        on_delete=models.SET_NULL,
        related_name="users",
        null=True,
        blank=True,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email
