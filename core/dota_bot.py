from contextlib import contextmanager
from secrets import token_hex

import gevent
from steam import SteamClient
from dota2 import Dota2Client


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

    @client.on('connected')
    def log_in():
        client.login(username=bot_account.login, password=bot_account.password)

    @client.on('logged_on')
    def start_dota():
        dota.launch()

    @dota.once('ready')
    def create_a_lobby():
        dota.create_practice_lobby(
            password=token_hex(16),
            options={
                'game_name': lobby_name,
            }
        )

    @dota.once('lobby_new')
    def setup_and_invite_all(lobby):
        for steam_id in steam_ids:
            dota.invite_to_lobby(steam_id)

    @dota.on('lobby_changed')
    def handle_change(lobby):
        invited_members = {
            member.id: member for member in lobby.members
            if member.id in steam_ids
        }
        pending = [
            steamid for steamid in lobby.pending_invites
            if steamid in steam_ids
        ]

        # Everyone joined
        if len(invited_members) == len(steam_ids):
            dota.leave_practice_lobby()

        # Someone didn't accept
        if len(invited_members) + len(pending) < len(steam_ids):
            dota.destroy_lobby()

        # if all(member.team != 4 for member in invited_members.values()):
        #     dota.launch_practice_lobby()

    @dota.on('lobby_removed')
    def finish_cycle(lobby):
        client.emit('cycle_finished')

    connect_with_retry(client)
    client.wait_event('cycle_finished')
