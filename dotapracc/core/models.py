from django.contrib.postgres.fields import ArrayField
from django.conf import settings
from django.db import models

from authentication.models import SteamUser


class HeroQuerySet(models.QuerySet):
    def lane_occupants(self, lane):
        assert lane in Hero.FIELD_MAP
        other_lanes = {l for l in Hero.FIELD_MAP if l != lane}
        query = models.Q()
        for other_lane in other_lanes:
            condition = Hero.FIELD_MAP[lane] + '__gte'
            value = models.F(Hero.FIELD_MAP[other_lane])
            query &= models.Q(**{condition: value})
        return self.filter(query)


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

    aliases = ArrayField(
        models.CharField(max_length=64, null=True, blank=True),
        null=True, blank=True,
    )

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

    def __str__(self):
        return f'{self.user.username} is training {self.hero}'
