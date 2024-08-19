# users/models.py

from uuid import uuid4

from aim.validations import phone_validation
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from .managers import CustomUserManager


class User(AbstractUser):
    id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    email = models.EmailField(_("email address"), unique=True)
    username = models.CharField(blank=True, null=True)
    phone_number = models.CharField(
        max_length=15, default="+923214567890", validators=[phone_validation]
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email
