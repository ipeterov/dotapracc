from contextlib import contextmanager

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


def invite(steam_ids, username, password, lobby_name, connect_retries=5):
    client = SteamClient()
    dota = Dota2Client(client)
    steam_ids = [int(steamid) for steamid in steam_ids]

    @client.on('connected')
    def log_in():
        client.login(username=username, password=password)

    @client.on('logged_on')
    def start_dota():
        dota.launch()

    @dota.on('ready')
    def create_a_lobby():
        dota.create_practice_lobby(
            password='123',
            options={
                'game_name': lobby_name,
            }
        )

    @dota.on('lobby_new')
    def setup_and_invite_all(lobby):
        for steam_id in steam_ids:
            dota.invite_to_lobby(steam_id)

    @dota.on('lobby_changed')
    def handle_change(lobby):
        members = {member.id: member for member in lobby.members}

        # Everyone joined
        if set(steam_ids).issubset(set(members)):
            dota.leave_practice_lobby()

    @dota.on('lobby_removed')
    def finish_cycle(lobby):
        client.emit('cycle_finished')

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

    client.wait_event('cycle_finished')
