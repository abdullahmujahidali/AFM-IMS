# usercompanyrelation/models.py

from uuid import uuid4

from django.db import models


class UserCompanyRelation(models.Model):
    ROLE_CHOICES = [
        ("Owner", "Owner"),
        ("Admin", "Admin"),
        ("Member", "Member"),
        ("Finance", "Finance"),
    ]

    id = models.UUIDField(default=uuid4, primary_key=True, editable=False)
    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="roles"
    )
    company = models.ForeignKey(
        "company.Company", on_delete=models.CASCADE, related_name="user_roles"
    )
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.role} at {self.company.name}"
