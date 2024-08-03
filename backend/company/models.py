# company/models.py

from uuid import uuid4

from django.db import models


class Company(models.Model):
    id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    name = models.CharField(max_length=255)
    status = models.BooleanField(default=False)
    owner = models.OneToOneField(
        "users.User", on_delete=models.CASCADE, related_name="owned_company"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
