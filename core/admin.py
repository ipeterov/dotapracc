from django.contrib import admin
from .models import Hero, HeroMatchup, SelectedHero


class HeroMatchupAdmin(admin.ModelAdmin):
    model = HeroMatchup

    def get_queryset(self, *args):
        return super().get_queryset(*args).select_related('hero', 'other_hero')


class HeroAdmin(admin.ModelAdmin):
    model = Hero
    list_per_page = 200


admin.site.register(Hero, HeroAdmin)
admin.site.register(HeroMatchup, HeroMatchupAdmin)
admin.site.register(SelectedHero)
