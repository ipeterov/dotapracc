import json
from datetime import timedelta

from django.db.models import *
from django.db.models import fields
from django.utils.timezone import now

from .models import PlayerSearch


def get_stats_as_string(days=7):
    return json.dumps(get_stats(days))


def get_stats(days=7):
    return {
        f'Active players (over {days}d)': calculate_active_players(days),
        'Searching now': calculate_searching_now(),
        f'Minutes since last match': calculate_most_recent_match(),
    }


def calculate_active_players(days):
    """Number of players who searched for a game in past n days"""
    threshold = now() - timedelta(days=days)
    steamids = PlayerSearch.objects.filter(started_at__gt=threshold, ).values_list(
        'user__steamid',
        flat=True,
    )

    return len(set(steamids))


def calculate_searching_now():
    return PlayerSearch.objects.active().count()


def calculate_average_queue_time(days):
    duration = ExpressionWrapper(
        F('ended_at') - F('started_at'), output_field=fields.DurationField()
    )
    threshold = now() - timedelta(days=days)

    durations = PlayerSearch.objects.filter(started_at__gt=threshold,
                                            state=PlayerSearch.SUCCESS).annotate(duration=duration
                                                                                ).values_list(
                                                                                    'duration',
                                                                                    flat=True,
                                                                                )

    if not durations:
        return '0s'

    in_seconds = [td.total_seconds() for td in durations if td is not None]
    raw = int(sum(in_seconds) / len(in_seconds))
    return f'{raw}s'


def calculate_most_recent_match():
    latest_success = PlayerSearch.objects.filter(state=PlayerSearch.SUCCESS
                                                ).latest('ended_at').ended_at
    minutes_passed = int((now() - latest_success).total_seconds() / 60)
    return f'{minutes_passed}'
