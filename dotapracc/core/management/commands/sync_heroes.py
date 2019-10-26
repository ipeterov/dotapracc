from django.core.management.base import BaseCommand
from django.db import transaction

from ...models import Hero, HeroMatchup
from ...dotabuff import DotaBuffAPI, LANES
from ...opendota import OpenDotaAPI


class Command(BaseCommand):
    help = 'Imports heroes and matchup data from OpenDota and DotaBuff'

    def import_heroes(self):
        print('Importing heroes...')
        raw_heroes = self.odota_api.get_heroes()
        heroes = list(Hero.objects.all())
        existing_hero_ids = {hero.opendota_id for hero in heroes}
        for raw_hero in raw_heroes:
            if raw_hero['id'] in existing_hero_ids:
                continue

            print(f'Creating {raw_hero["localized_name"]}...')
            hero = Hero.objects.create(
                name=raw_hero['localized_name'],
                opendota_id=raw_hero['id'],
            )
            heroes.append(hero)
            existing_hero_ids.add(hero.opendota_id)
        return heroes

    def import_matchups(self, heroes):
        def create_matchups(hero_opendota_id, raw_matchups):
            hero_id = hero_id_by_opendota_id[hero_opendota_id]
            matchups = []
            for raw_matchup in raw_matchups:
                other_hero_id = hero_id_by_opendota_id[raw_matchup['hero_id']]
                advantage = raw_matchup['advantage']
                matchups.append(HeroMatchup(
                    hero_id=hero_id,
                    other_hero_id=other_hero_id,
                    advantage=advantage,
                ))
            return matchups

        hero_id_by_opendota_id = dict(
            Hero.objects.values_list('opendota_id', 'id')
        )

        all_matchups = []
        for hero in heroes:
            print(f'Fetching {hero.name} matchups...')
            raw_matchups = self.odota_api.get_hero_matchups(hero.opendota_id)
            matchups = create_matchups(hero.opendota_id, raw_matchups)
            all_matchups.extend(matchups)

        print('Deleting old matchups...')
        HeroMatchup.objects.all().delete()
        print('Creating new matchups...')
        HeroMatchup.objects.bulk_create(all_matchups)

    def import_meta(self, heroes):
        heroes_by_name = {
            hero.name: hero
            for hero in heroes
        }

        for lane in LANES:
            print(f'Fetching {lane} meta...')
            meta = self.db_api.get_lane_meta(lane)
            field_name = Hero.FIELD_MAP[lane]
            for hero_name in meta:
                hero = heroes_by_name[hero_name]
                setattr(hero, field_name, meta[hero_name])

        for hero in heroes:
            print(f'Saving {hero} meta...')
            hero.save()

    @transaction.atomic
    def handle(self, *args, **options):
        self.odota_api = OpenDotaAPI()
        self.db_api = DotaBuffAPI()

        heroes = self.import_heroes()
        self.import_meta(heroes)
        self.import_matchups(heroes)
        for hero in heroes:
            hero.update_matchups()
