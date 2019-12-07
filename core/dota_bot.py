import random
from contextlib import contextmanager
from secrets import token_hex

import gevent
from dota2 import Dota2Client
from steam import SteamClient
from steam.enums import EResult
from steam.enums.common import EFriendRelationship


@contextmanager
def busy(account):
    if account.is_busy:
        raise ValueError(f'Account {account} is already busy')

    account.is_busy = True
    account.save()

    try:
        yield account
    finally:
        account.is_busy = False
        account.save()


def connect_with_retry(client, connect_retries=5):
    # Sometimes it hangs for 30+ seconds. Normal connection takes about 500ms
    for _ in range(connect_retries):
        try:
            with gevent.Timeout(2):
                client.connect()
        except gevent.timeout.Timeout:
            client._connecting = False
        else:
            break
    else:
        raise Exception(f'Max connect retries ({connect_retries}) exceeded')


def invite(steam_ids, bot_account, lobby_name):
    client = SteamClient()
    dota = Dota2Client(client)

    steam_ids = [int(steamid) for steamid in steam_ids]
    yielded = set()

    @client.on('connected')
    def log_in():
        client.login(username=bot_account.login, password=bot_account.password)

    @client.on('logged_on')
    def start_dota():
        dota.launch()

    @dota.once('ready')
    def create_a_lobby():
        dota.create_practice_lobby(password=token_hex(16), options={
            'game_name': lobby_name,
        })

    @dota.once('lobby_new')
    def setup_and_invite_all(lobby):
        client.emit('info', 'lobby_created', random.choice(steam_ids))
        for steam_id in steam_ids:
            dota.invite_to_lobby(steam_id)

    @dota.on('lobby_changed')
    def handle_change(lobby):
        in_lobby = {member.id for member in lobby.members if member.id in steam_ids}
        pending = {steamid for steamid in lobby.pending_invites if steamid in steam_ids}
        leavers = set(steam_ids) - (in_lobby | pending)

        nonlocal yielded
        to_yield = in_lobby - yielded
        for steam_id in to_yield:
            yielded.add(steam_id)
            client.emit('info', 'in_lobby', steam_id)

        if len(in_lobby) == len(steam_ids):
            dota.leave_practice_lobby()

        if leavers:
            leaver_id = list(leavers)[0]
            dota.destroy_lobby()
            client.emit('info', 'leaver', leaver_id)

    @dota.on('lobby_removed')
    def finish_cycle(lobby):
        client.emit('info', 'cycle_finished')

    connect_with_retry(client)
    while True:
        args = client.wait_event('info')
        if args[0] == 'cycle_finished':
            return
        else:
            assert len(args) == 2
            yield args


def send_friend_request(steam_id, bot_account):
    client = SteamClient()
    steam_id = int(steam_id)

    @client.on('connected')
    def log_in():
        client.login(username=bot_account.login, password=bot_account.password)

    @client.friends.on('ready')
    def send_request():
        client.friends.add(steam_id)

    connect_with_retry(client)
    eresult, steam_id = client.friends.wait_event(client.friends.EVENT_FRIEND_ADD_RESULT)
    return eresult == EResult.OK, eresult


def wait_for_friend_request_answer(steam_id, bot_account, block=True):
    client = SteamClient()
    steam_id = int(steam_id)

    @client.on('connected')
    def log_in():
        client.login(username=bot_account.login, password=bot_account.password)

    @client.friends.on('ready')
    @client.friends.on('friend_new')
    def check_friends(*args):
        nonlocal client
        friends = {
            int(friend.steam_id)
            for friend in client.friends if friend.relationship == EFriendRelationship.Friend
        }
        if steam_id in friends:
            client.emit('cycle_finished', True)
        elif not block:
            client.emit('cycle_finished', False)

    connect_with_retry(client)
    in_friends = client.wait_event('cycle_finished')[0]
    return in_friends


def send_chat_message(steam_id, bot_account, message):
    client = SteamClient()
    steam_id = int(steam_id)

    @client.on('connected')
    def log_in():
        client.login(username=bot_account.login, password=bot_account.password)

    @client.on('logged_on')
    def send_message():
        recipient = client.get_user(steam_id, fetch_persona_state=False)
        recipient.send_message(message)
        client.emit('cycle_finished')

    connect_with_retry(client)
    client.wait_event('cycle_finished')
