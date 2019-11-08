import json
import time
import random
from collections import defaultdict

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django_fsm import FSMField, transition

from django.conf import settings
from django.db import models, transaction
from django.utils.timezone import now

from authentication.models import SteamUser


class HeroQuerySet(models.QuerySet):
    def lane_occupants(self, lane):
        assert lane in Hero.FIELD_MAP
        condition = {
            Hero.FIELD_MAP[lane] + '__gte': settings.LANE_PRESENCE_CUTOFF
        }
        return self.filter(**condition)


class Hero(models.Model):
    FIELD_MAP = {
        'mid': 'midlane_presence',
        'safe': 'safelane_presence',
        'off': 'offlane_presence',
        'jungle': 'jungle_presence',
    }

    name = models.CharField(max_length=64)

    opendota_id = models.IntegerField(unique=True)
    picture = models.ImageField(upload_to='hero_images')

    aliases = models.TextField(null=True, blank=True)

    primary_attribute = models.CharField(max_length=9, choices=(
        ('Strength', 'Strength'),
        ('Intellect', 'Intellect'),
        ('Agility', 'Agility'),
    ))
    attack_type = models.CharField(max_length=6, choices=(
        ('Melee', 'Melee'),
        ('Ranged', 'Ranged'),
    ))

    midlane_presence = models.FloatField(default=0)
    safelane_presence = models.FloatField(default=0)
    offlane_presence = models.FloatField(default=0)
    jungle_presence = models.FloatField(default=0)

    counters = models.ManyToManyField('self', blank=True, related_name='+')
    easy_lanes = models.ManyToManyField('self', blank=True, related_name='+')

    objects = HeroQuerySet.as_manager()

    def __str__(self):
        return self.name

    def update_matchups(self):
        midlaners = Hero.objects.lane_occupants('mid')
        matchup_qs = (
            self.matchups
                .select_related('other_hero')
                .filter(other_hero__in=midlaners)
        )

        counters = matchup_qs.order_by('advantage')[:settings.TOP_N_MATCHUPS]
        self.counters.set(matchup.other_hero for matchup in counters)

        easy_lanes = matchup_qs.order_by('-advantage')[:settings.TOP_N_MATCHUPS]
        self.easy_lanes.set(matchup.other_hero for matchup in easy_lanes)


class HeroMatchup(models.Model):
    hero = models.ForeignKey(
        Hero,
        on_delete=models.CASCADE,
        related_name='matchups',
    )
    other_hero = models.ForeignKey(
        Hero,
        on_delete=models.CASCADE,
        related_name='+',
    )

    advantage = models.FloatField()

    def __str__(self):
        hero, advantage, other_hero = self.hero, self.advantage, self.other_hero
        return f'{hero} has {advantage} advantage over {other_hero}'


class SelectedHeroQuerySet(models.QuerySet):
    def as_dict(self):
        return {
            sh.hero.name: sh.matchups.values_list('name', flat=True)
            for sh in self.all()
        }

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
        SteamUser, on_delete=models.CASCADE, related_name='selected_heroes',
    )
    hero = models.ForeignKey(
        Hero, on_delete=models.CASCADE, related_name='+',
    )
    matchups = models.ManyToManyField(
        Hero, blank=True, related_name='+',
    )
    is_switched_on = models.BooleanField(default=True)

    objects = SelectedHeroQuerySet.as_manager()

    def __str__(self):
        return f'{self.user} is training {self.hero}'


class PlayerSearchManager(models.Manager):
    @transaction.atomic
    def find_matches(self):
        searching = self.filter(state='started_search')

        for search in searching:
            for other in searching:
                if search == other:
                    continue

                if search.state != 'started_search' or other.state != 'started_search':
                    continue

                if search.can_match_with(other):
                    search.suggest_match(other)
                    search.save()
                    search.push_to_websocket()

                    other.suggest_match(search)
                    other.save()
                    other.push_to_websocket()

    def active(self):
        return self.filter(state__in={
            'started_search',
            'found_match',
            'accepted_match',
        })


class PlayerSearch(models.Model):
    user = models.ForeignKey(
        SteamUser, on_delete=models.CASCADE, related_name='searches',
    )
    match = models.ForeignKey(
        'self', on_delete=models.SET_NULL, blank=True, null=True,
        related_name='+',
    )

    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    state = FSMField(default='started_search')

    channel_name = models.CharField(max_length=64, blank=True, null=True)

    objects = PlayerSearchManager()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user'],
                condition=models.Q(state__in={
                    'started_search',
                    'found_match',
                    'accepted_match',
                }),
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

    def dumps(self):
        return json.dumps(self.as_dict())

    def push_to_websocket(self):
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.send)(
            self.channel_name,
            {
                'type': 'websocket.send',
                'message': self.dumps(),
            },
        )

    @transition(field=state, source='started_search', target='cancelled')
    def cancel_search(self):
        self.ended_at = now()

    @transition(field=state, source='started_search', target='found_match')
    def suggest_match(self, other_search):
        self.match = other_search

    @transition(field=state, source='found_match', target='accepted_match')
    def accept_match(self):
        self.ended_at = now()

    @transition(
        field=state,
        source=['found_match', 'accepted_match'],
        target='started_search',
    )
    def decline_match(self):
        pass

    @transition(field=state, source='accepted_match', target='finished')
    def set_finished(self):
        pass

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
