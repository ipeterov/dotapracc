from celery import shared_task

from .models import PlayerSearch


@shared_task
def matchmaking():
    PlayerSearch.objects.find_matches()
