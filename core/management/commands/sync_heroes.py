from django.core.management.base import BaseCommand

from ...sync import HeroSyncer


class Command(BaseCommand):
    help = 'Imports heroes and matchup data from OpenDota and DotaBuff'

    def handle(self, *args, **options):
        syncer = HeroSyncer()
        syncer.sync_heroes()
