# Django
from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):

    requires_system_checks = []

    def handle(self, *args, **options):
        verbosity = options["verbosity"]
        call_command("migrate", verbosity=verbosity)
        if verbosity > 0:
            self.stdout.write("Migrations applied.")
