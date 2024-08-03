# Django
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    requires_system_checks = []
    SQL_COMMAND = """
    DO $$ DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
    END $$;
    """

    def _drop_all_tables(self):
        connection.autocommit = True
        with connection.cursor() as cursor:
            cursor.execute(self.SQL_COMMAND)

    def handle(self, *args, **options):
        verbosity = options["verbosity"]

        if settings.ENVIRONMENT != "PRODUCTION" and settings.DEBUG:
            self._drop_all_tables()
            if verbosity > 0:
                self.stdout.write("Every table in the database has been deleted.")
        else:
            self.stderr.write(
                "Warning: This command cannot run in Production environment."
            )
