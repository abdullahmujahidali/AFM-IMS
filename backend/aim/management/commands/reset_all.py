# Django
from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):

    requires_system_checks = []

    def handle(self, *args, **options):
        verbosity = options["verbosity"]

        call_command("drop_all_tables", verbosity=verbosity)
        call_command("automate", verbosity=verbosity)
        call_command("generate_data", verbosity=verbosity)
