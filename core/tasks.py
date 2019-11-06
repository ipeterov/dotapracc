from celery import shared_task

from core.models import PlayerSearch
from core.sync import HeroSyncer


@shared_task
def matchmaking():
    PlayerSearch.objects.find_matches()


@shared_task
def sync_heroes():
    syncer = HeroSyncer()
    syncer.sync_heroes()
