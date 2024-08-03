# Django
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import connections


class Command(BaseCommand):
    """Finds all the databases and runs the migrate command."""

    def handle(self, *args, **options):
        databases = connections.databases
        for name, db in databases.items():
            call_command("migrate", database=name)
