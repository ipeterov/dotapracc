from celery import shared_task

from core.dota_bot import invite, busy
from core.models import PlayerSearch, BotAccount
from core.sync import HeroSyncer


@shared_task
def matchmaking():
    PlayerSearch.objects.find_matches()


@shared_task
def invite_players(steam_ids, lobby_name='dotapra.cc'):
    bot_account = BotAccount.objects.free_bot()
    with busy(bot_account):
        invite(
            steam_ids,
            username=bot_account.login,
            password=bot_account.password,
            lobby_name=lobby_name,
        )


@shared_task
def sync_heroes():
    syncer = HeroSyncer()
    syncer.sync_heroes()
