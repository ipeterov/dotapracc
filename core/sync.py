from django.db import transaction

from .models import Hero
from .dotabuff import DotaBuffAPI, LANES
from .opendota import OpenDotaAPI


class HeroSyncer:
    def import_heroes(self):
        print('Importing heroes...')
        raw_heroes = self.odota_api.get_heroes()
        heroes = list(Hero.objects.all())
        existing_hero_ids = {hero.opendota_id for hero in heroes}
        for i, raw_hero in enumerate(raw_heroes):
            name = raw_hero['localized_name']
            picture = self.odota_api.get_hero_picture(name)
            primary_attr = {
                'str': 'Strength',
                'agi': 'Agility',
                'int': 'Intellect',
            }[raw_hero['primary_attr']]

            print(f'Updating or creating {name} ({i}/{len(raw_heroes)})...')
            hero, created = Hero.objects.update_or_create(
                name=name,
                opendota_id=raw_hero['id'],
                defaults={
                    'picture': picture,
                    'primary_attribute': primary_attr,
                    'attack_type': raw_hero['attack_type'],
                }
            )
            if created:
                heroes.append(hero)
            existing_hero_ids.add(hero.opendota_id)
        return heroes

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

        for i, hero in enumerate(heroes):
            print(f'Saving {hero} meta ({i}/{len(heroes)})...')
            hero.save()

    def import_pro_matchups(self, heroes):
        hero_id_by_opendota_id = dict(
            Hero.objects.values_list('opendota_id', 'id')
        )

        for i, hero in enumerate(heroes):
            print(f'Getting pro matchups of {hero.name} ({i}/{len(heroes)})...')
            odota_ids = self.odota_api.get_pro_matchups(hero.opendota_id)
            matchup_ids = [hero_id_by_opendota_id[oid] for oid in odota_ids]
            hero.pro_matchups.set(matchup_ids)

    def sync_heroes(self):
        self.odota_api = OpenDotaAPI()
        self.db_api = DotaBuffAPI()

        heroes = self.import_heroes()
        self.import_meta(heroes)
        self.import_pro_matchups(heroes)
