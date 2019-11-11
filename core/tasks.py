from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer

from core.dota_bot import invite, busy


@shared_task
def matchmaking():
    from core.models import PlayerSearch

    PlayerSearch.objects.find_matches()


@shared_task
def invite_players(steam_ids, lobby_name):
    from authentication.models import SteamUser
    from core.models import BotAccount, PlayerSearch

    bot_account = BotAccount.objects.free_bot()
    with busy(bot_account):
        for info, steam_id in invite(steam_ids, bot_account, lobby_name):
            user = SteamUser.objects.get(steamid=steam_id)
            search = PlayerSearch.objects.current_search(user)
            if info == 'leaver':
                PlayerSearch.objects.cancel(search)
                break
            elif info == 'in_lobby':
                PlayerSearch.objects.join_lobby(search)


@shared_task
def sync_heroes():
    from core.sync import HeroSyncer

    syncer = HeroSyncer()
    syncer.sync_heroes()


@shared_task
def push_stats():
    from core.stats import get_stats_as_string

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'stats',
        {'type': 'websocket.stats', 'message': get_stats_as_string()},
    )
