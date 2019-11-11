from django.urls import path

from . import consumers


websocket_urlpatterns = [
    path('ws/find_match', consumers.MatchFinderConsumer),
    path('ws/stats', consumers.StatsConsumer),
]
