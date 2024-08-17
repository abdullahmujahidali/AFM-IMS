from aim.abstract_models import ID, Dates, Name
from aim.utils import generate_unique_slug
from django.db import models


class Company(ID, Name, Dates):
    slug = models.SlugField(unique=True, blank=True)
    status = models.BooleanField(default=False)
    owner = models.OneToOneField(
        "users.User", on_delete=models.CASCADE, related_name="owned_company"
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self.name, Company)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
