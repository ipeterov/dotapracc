import json
import random
import time
from collections import defaultdict

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.db import models, transaction
from django.utils.timezone import now
from django_fsm import FSMField, transition
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFill

from authentication.models import SteamUser
from .tasks import invite_players


class HeroQuerySet(models.QuerySet):
    def lane_occupants(self, lane, cutoff=None):
        assert lane in Hero.FIELD_MAP

        if cutoff is None:
            cutoff = settings.LANE_PRESENCE_CUTOFF

        condition = {Hero.FIELD_MAP[lane] + '__gte': cutoff}
        return self.filter(**condition)


class Hero(models.Model):
    FIELD_MAP = {
        'mid': 'midlane_presence',
        'safe': 'safelane_presence',
        'off': 'offlane_presence',
        'jungle': 'jungle_presence',
    }

    name = models.CharField(max_length=64)
    picture = models.ImageField(upload_to='hero_images')
    picture_thumbnail = ImageSpecField(
        source='picture',
        processors=[ResizeToFill(78, 44)],
        format='WebP',
    )
    opendota_id = models.IntegerField(unique=True)

    primary_attribute = models.CharField(
        max_length=9,
        choices=(
            ('Strength', 'Strength'),
            ('Intellect', 'Intellect'),
            ('Agility', 'Agility'),
        )
    )
    attack_type = models.CharField(
        max_length=6, choices=(
            ('Melee', 'Melee'),
            ('Ranged', 'Ranged'),
        )
    )

    midlane_presence = models.FloatField(default=0)
    safelane_presence = models.FloatField(default=0)
    offlane_presence = models.FloatField(default=0)
    jungle_presence = models.FloatField(default=0)

    pro_matchups = models.ManyToManyField(
        'self',
        blank=True,
        related_name='+',
        symmetrical=False,
    )

    objects = HeroQuerySet.as_manager()

    def __str__(self):
        return self.name


class SelectedHeroQuerySet(models.QuerySet):
    def as_dict(self):
        return {sh.hero.name: sh.matchups.values_list('name', flat=True) for sh in self.all()}

    def as_reverse_dict(self):
        reverse = defaultdict(list)
        for hero, matchups in self.as_dict().items():
            for matchup in matchups:
                reverse[matchup].append(hero)
        return reverse

    def active(self):
        return self.filter(is_switched_on=True)


class SelectedHero(models.Model):
    user = models.ForeignKey(
        SteamUser,
        on_delete=models.CASCADE,
        related_name='selected_heroes',
    )
    hero = models.ForeignKey(
        Hero,
        on_delete=models.CASCADE,
        related_name='+',
    )
    matchups = models.ManyToManyField(
        Hero,
        blank=True,
        related_name='+',
    )
    is_switched_on = models.BooleanField(default=True)

    objects = SelectedHeroQuerySet.as_manager()

    def __str__(self):
        return f'{self.user} is training {self.hero}'


class PlayerSearchManager(models.Manager):
    @transaction.atomic
    def find_matches(self):
        searching = self.filter(state=self.model.SEARCHING)
        for search in searching:
            for other in searching:
                if search == other:
                    continue

                # State can change in this loop
                if search.state == other.state != self.model.SEARCHING:
                    continue

                if search.can_match_with(other):
                    self.suggest_match(search, other)

    def active(self):
        return self.filter(state__in=self.model.ACTIVE_STATES)

    def current_search(self, user):
        return self.active().filter(user=user).first()

    @staticmethod
    def suggest_match(search1, search2):
        search1.suggest_match(search2)
        search1.save()
        search2.suggest_match(search1)
        search2.save()

    def accept_match(self, search):
        search.accept_match()
        if search.match.state == self.model.ACCEPTED_MATCH:
            search.to_lobby_setup()
            search.match.to_lobby_setup()

            steam_ids = [
                search.user.steamid,
                search.match.user.steamid,
            ]
            lobby_name = (
                f'dotapra.cc - '
                f'{search.user.personaname} & {search.match.user.personaname}'
            )
            invite_players.delay(steam_ids, lobby_name)

            search.match.save()
        search.save()

    @staticmethod
    def lobby_ready(search):
        search.to_lobby_ready()
        search.save()
        search.match.to_lobby_ready()
        search.match.save()

    def join_lobby(self, search):
        search.join_lobby()
        if search.match.state == self.model.IN_LOBBY:
            search.finalize()
            search.match.finalize()
            search.match.save()
        search.save()

    @staticmethod
    def cancel(search):
        search.cancel()
        search.save()
        if search.match:
            search.match.back_to_search()
            search.match.save()

    @staticmethod
    def update_channel(search, channel_name):
        search.channel_name = channel_name
        search.save()


class PlayerSearch(models.Model):
    SEARCHING = 'searching'
    CANCELLED = 'cancelled'
    FOUND_MATCH = 'found_match'
    ACCEPTED_MATCH = 'accepted_match'
    LOBBY_SETUP = 'lobby_setup'
    LOBBY_READY = 'lobby_ready'
    IN_LOBBY = 'in_lobby'
    SUCCESS = 'success'

    STATE_CHOICES = (
        (SEARCHING, 'Searching for a match'),
        (CANCELLED, 'Cancelled search'),
        (FOUND_MATCH, 'Found a match'),
        (ACCEPTED_MATCH, 'Accepted the match'),
        (LOBBY_SETUP, 'Setting up a lobby'),
        (LOBBY_READY, 'Lobby ready'),
        (IN_LOBBY, 'In lobby'),
        (SUCCESS, 'Successfully matched'),
    )

    ACTIVE_STATES = [
        SEARCHING,
        FOUND_MATCH,
        ACCEPTED_MATCH,
        LOBBY_SETUP,
        LOBBY_READY,
        IN_LOBBY,
    ]

    user = models.ForeignKey(
        SteamUser,
        on_delete=models.CASCADE,
        related_name='searches',
    )
    match = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='+',
    )

    channel_name = models.CharField(max_length=64, blank=True, null=True)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    state = FSMField(default=SEARCHING, choices=STATE_CHOICES, protected=True)

    objects = PlayerSearchManager()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user'],
                condition=models.Q(
                    # Can't access variables here
                    state__in=[
                        'searching',
                        'found_match',
                        'accepted_match',
                        'lobby_setup',
                        'lobby_ready',
                        'in_lobby',
                    ]
                ),
                name='unique_active_search',
            ),
        ]

    def __str__(self):
        return f'{self.user} started at {self.started_at}'

    def as_dict(self):
        match = self.match
        return {
            'state': self.state,
            'startedAt': self.started_at and self.started_at.isoformat(),
            'heroPairs': match and self.hero_pairs(match),
            'opponent': {
                'id': match.user.steam32id,
                'personaName': match.user.personaname,
                'mmrEstimate': match.user.mmr_estimate,
                'profileText': match.user.profile_text,
            } if match else {},
        }

    def push_to_websocket(self):
        if not self.channel_name:
            return

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.send)(
            self.channel_name,
            {
                'type': 'websocket.find.match',
                'message': json.dumps(self.as_dict()),
            },
        )

    def hero_pairs(self, other):
        self_heroes = self.user.selected_heroes.active().as_dict()
        other_reverse = other.user.selected_heroes.active().as_reverse_dict()

        pairs = []
        for hero, matchups in self_heroes.items():
            for matchup in matchups:
                if matchup in other_reverse[hero]:
                    pairs.append((hero, matchup))

        return pairs

    def can_match_with(self, other):
        if not self.hero_pairs(other):
            return False
        return True

    @transition(state, SEARCHING, FOUND_MATCH)
    def suggest_match(self, match):
        self.match = match

    @transition(state, FOUND_MATCH, ACCEPTED_MATCH)
    def accept_match(self):
        pass

    @transition(state, ACCEPTED_MATCH, LOBBY_SETUP)
    def to_lobby_setup(self):
        pass

    @transition(state, LOBBY_SETUP, LOBBY_READY)
    def to_lobby_ready(self):
        pass

    @transition(state, LOBBY_READY, IN_LOBBY)
    def join_lobby(self):
        pass

    @transition(state, IN_LOBBY, SUCCESS)
    def finalize(self):
        self.ended_at = now()

    @transition(state, (SEARCHING, FOUND_MATCH, LOBBY_SETUP, IN_LOBBY), CANCELLED)
    def cancel(self):
        self.ended_at = now()

    @transition(state, (FOUND_MATCH, ACCEPTED_MATCH, LOBBY_SETUP, IN_LOBBY), SEARCHING)
    def back_to_search(self):
        pass

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.push_to_websocket()


class BotAccountManager(models.Manager):
    def free_bot(self):
        while True:
            free = list(self.filter(is_busy=False))

            if not free:
                time.sleep(1)
            else:
                return random.choice(free)


class BotAccount(models.Model):
    login = models.CharField(max_length=64)
    password = models.CharField(max_length=128)
    is_busy = models.BooleanField()

    objects = BotAccountManager()

    def __str__(self):
        return self.login
