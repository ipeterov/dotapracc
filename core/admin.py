from django.contrib import admin
from .models import Hero, PlayerSearch, SelectedHero, BotAccount


@admin.register(Hero)
class HeroAdmin(admin.ModelAdmin):
    model = Hero
    list_per_page = 200
    list_display = (
        'name',
        'midlane_presence',
        'opendota_id',
    )


@admin.register(PlayerSearch)
class PlayerSearchAdmin(admin.ModelAdmin):
    model = PlayerSearch
    list_display = (
        'user',
        'started_at',
        'ended_at',
        'state',
    )
    radio_fields = {'state': admin.HORIZONTAL}


@admin.register(BotAccount)
class BotAccountAdmin(admin.ModelAdmin):
    model = BotAccount
    list_display = (
        'login',
        'is_busy',
    )


@admin.register(SelectedHero)
class SelectedHeroAdmin(admin.ModelAdmin):
    model = SelectedHero
    list_display = (
        'user',
        'hero',
        'is_switched_on',
    )
    filter_horizontal = ['matchups']
