from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from django.conf import settings
from django.db import models


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
    aliases = ArrayField(
        models.CharField(max_length=64, null=True, blank=True),
        null=True, blank=True,
    )

    midlane_presence = models.FloatField(default=0)
    safelane_presence = models.FloatField(default=0)
    offlane_presence = models.FloatField(default=0)
    jungle_presence = models.FloatField(default=0)

    objects = HeroQuerySet.as_manager()

    def __str__(self):
        return self.name


class HeroMatchup(models.Model):
    hero = models.ForeignKey(
        Hero,
        on_delete=models.CASCADE,
        related_name='+',
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
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    hero = models.ForeignKey(Hero, on_delete=models.CASCADE)

    auto_meta = models.BooleanField()
    auto_counterpick = models.BooleanField()
    auto_stomp = models.BooleanField()

    wanted_matchups = models.ManyToManyField(
        Hero, blank=True, related_name='+',
    )

    total_matchups = models.ManyToManyField(Hero, blank=True, related_name='+')

    def __str__(self):
        return f'{self.user.username} wants to play {self.hero}'

    def calculate_matchups(self):
        calculated_matchups = []
        calculated_matchups.extend(self.wanted_matchups.all())

        midlaners = Hero.objects.lane_occupants('mid')
        matchup_qs = (
            HeroMatchup.objects
                .select_related('other_hero')
                .filter(hero=self.hero, other_hero__in=midlaners)
        )

        if self.auto_counterpick:
            counterpicks = [
                matchup.other_hero
                for matchup in matchup_qs
                    .order_by('-advantage')
                    [:settings.AUTOMATCHUP_TOP_COUNT]
            ]
            calculated_matchups.extend(counterpicks)

        if self.auto_stomp:
            stomps = [
                matchup.other_hero
                for matchup in matchup_qs
                    .order_by('advantage')
                    [:settings.AUTOMATCHUP_TOP_COUNT]
            ]
            calculated_matchups.extend(stomps)

        if self.auto_meta:
            calculated_matchups.extend(midlaners)

        calculated_matchups = set(calculated_matchups)
        self.total_matchups.set(calculated_matchups)
