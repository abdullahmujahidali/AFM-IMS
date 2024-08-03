# Standard Library
import shlex
import subprocess

# Django
from django.core.management.base import BaseCommand

DELETE_COMMAND = 'find . -path "*/migrations/*.py" -not -name "__init__.py" -delete'


class Command(BaseCommand):
    def handle(self, *args, **options):
        subprocess.run(shlex.split(DELETE_COMMAND))
        if options["verbosity"] > 0:
            self.stdout.write("Removing all migration files ... OK")
