from django.db import models
from django.db.models.query import QuerySet


class TenantQuerySet(QuerySet):
    def for_company(self, company):
        return self.filter(company=company)


class TenantManager(models.Manager):
    def get_queryset(self):
        return TenantQuerySet(self.model, using=self._db)

    def for_company(self, company):
        return self.get_queryset().for_company(company)
