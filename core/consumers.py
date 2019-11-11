from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from .models import PlayerSearch
from .stats import get_stats_as_string


class MatchFinderConsumer(WebsocketConsumer):
    def websocket_find_match(self, event):
        """Needed for PlayerSearch.push_to_websocket"""
        self.send(event['message'])

    def connect(self):
        user = self.scope['user']
        current_search = PlayerSearch.objects.current_search(user)

        self.accept()

        if current_search:
            PlayerSearch.objects.update_channel(
                current_search,
                self.channel_name
            )

    def receive(self, text_data=None, bytes_data=None):
        command = text_data
        assert command in {
            'start_search',
            'accept_match',
            'cancel',
        }

        user = self.scope['user']
        current_search = PlayerSearch.objects.current_search(user)

        if command == 'start_search':
            assert current_search is None
            PlayerSearch.objects.create(
                user=user,
                channel_name=self.channel_name,
            )
            return

        assert current_search is not None

        PlayerSearch.objects.update_channel(
            current_search,
            self.channel_name
        )

        if command == 'accept_match':
            PlayerSearch.objects.accept_match(current_search)
        elif command == 'cancel':
            PlayerSearch.objects.cancel(current_search)


class StatsConsumer(WebsocketConsumer):
    def websocket_stats(self, event):
        self.send(event['message'])

    def connect(self):
        self.accept()

        stats = get_stats_as_string()
        self.send(stats)

        async_to_sync(self.channel_layer.group_add)(
            'stats',
            self.channel_name,
        )

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            'stats',
            self.channel_name,
        )
