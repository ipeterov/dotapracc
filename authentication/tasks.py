from celery import shared_task

from authentication.models import SteamUser


@shared_task
def sync_user_with_opendota(steamid):
    user = SteamUser.objects.get(steamid=steamid)
    user.sync_with_opendota()
    user.save()


@shared_task
def sync_all_with_opendota():
    for steamid in SteamUser.objects.values_list('steamid', flat=True):
        sync_user_with_opendota.delay(steamid)
