from channels.generic.websocket import WebsocketConsumer

from .models import PlayerSearch
from .tasks import invite_players


class MatchFinderConsumer(WebsocketConsumer):
    def websocket_send(self, event):
        self.send(event['message'])

    def current_search(self):
        user = self.scope['user']
        search = user.searches.active().first()
        if not search:
            search = PlayerSearch(state='not_searching')
        return search

    def connect(self):
        self.accept()
        current_search = self.current_search()
        if current_search and current_search.state != 'not_searching':
            current_search.channel_name = self.channel_name
            current_search.save()
        self.send(current_search.dumps())

    def disconnect(self, close_code):
        pass

    def receive(self, text_data=None, bytes_data=None):
        command = text_data
        current_search = self.current_search()

        if command == 'start_search':
            current_search = PlayerSearch(user=self.scope['user'])

        elif command == 'cancel_search':
            current_search.cancel_search()

        elif command == 'accept_match':
            current_search.accept_match()
            if current_search.match.state == 'accepted_match':
                current_search.set_finished()
                current_search.match.set_finished()

                steam_ids = [
                    current_search.user.steamid,
                    current_search.match.user.steamid,
                ]
                invite_players.delay(steam_ids)

        elif command == 'decline_match':
            current_search.decline_match()
            current_search.match.decline_match()

        current_search.channel_name = self.channel_name
        current_search.save()
        if current_search.match:
            current_search.match.save()
            current_search.match.push_to_websocket()

        self.send(current_search.dumps())
