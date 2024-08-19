from bulk_update_or_create.query import BulkUpdateOrCreateQuerySet


class UserTenantRelationManager(BulkUpdateOrCreateQuerySet):
    """Custom manager for UserTenantRelation model. Help create different\
        kinds of relations between tenant and user\
        depending on the role. And all of these methods are\
        being used in testing."""

    def create_relation(self, user, company, role, *args, **kwargs):
        """Simply create a relation depending on the params.
        Also adds activation token."""
        return super().create(
            company=company,
            user=user,
            *args,
            **kwargs,
        )
