# Django
# 3rd Party Libraries
from bulk_update_or_create.query import BulkUpdateOrCreateQuerySet
from django.apps import apps


class UserCompanyRelationManager(BulkUpdateOrCreateQuerySet):
    """Custom manager for UserCompanyModel model. Help create different\
        kinds of relations between company and user\
        depending on the role. And all of these methods are\
        being used in testing."""

    def create_relation(self, user, company, role, *args, **kwargs):
        """Simply create a relation depending on the params.
        Also adds activation token."""
        return super().create(
            role=role,
            company=company,
            user=user,
            *args,
            **kwargs,
        )

    def create_owner(self, user, company, *args, **kwargs):
        """Creates a relation with role of scripter."""
        return self.create_relation(
            user=user,
            company=company,
            role=apps.get_model("usercompanyrelation.role").objects.get_owner(),
            *args,
            **kwargs,
        )

    def create_member(self, user, company, *args, **kwargs):
        """Creates a relation with role of scripter."""
        return self.create_relation(
            user=user,
            company=company,
            role=apps.get_model("usercompanyrelation.role").objects.get_member(),
            *args,
            **kwargs,
        )

    def create_finance(self, user, company, *args, **kwargs):
        """Creates a relation with role of scripter."""
        return self.create_relation(
            user=user,
            company=company,
            role=apps.get_model("usercompanyrelation.role").objects.get_finance(),
            *args,
            **kwargs,
        )

    def create_admin(self, user, company, *args, **kwargs):
        """Creates a relation with role of admin."""
        return self.create_relation(
            user=user,
            company=company,
            role=apps.get_model("usercompanyrelation.role").objects.get_admin(),
            *args,
            **kwargs,
        )
