# Standard Library
import shlex
import subprocess

# Django
from django.core.management.base import BaseCommand

COMM = 'find . -path "*/migrations/*.py" -not -name "__init__.py" -delete'


class Command(BaseCommand):
    def handle(self, *args, **options):
        subprocess.run(shlex.split(COMM))
        if options["verbosity"] > 0:
            self.stdout.write("Removing all migration files ... OK")
