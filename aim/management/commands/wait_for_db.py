"""
Django command to wait for the database to be available.
"""
# Standard Library
import time

# Django
from django.core.management.base import BaseCommand
from django.db.utils import OperationalError

# 3rd Party Libraries
from psycopg2 import OperationalError as Psycog2Error


class Command(BaseCommand):
    """Django command to wait for the database."""

    def handle(self, *args, **options):
        """Entry point for command."""
        self.stdout.write("Waiting for the database....")
        db_up = False
        while db_up is False:
            try:
                self.check(databases=["default"])
                db_up = True
            except (Psycog2Error, OperationalError):
                self.stdout.write("Database unavailable, waiting for 1 second...")
                time.sleep(1)
        self.stdout.write(self.style.SUCCESS("Database is ready."))
