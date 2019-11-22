import math

import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.utils.text import slugify
from requests.compat import urljoin


# https://www.evanmiller.org/how-not-to-sort-by-average-rating.html
def wilson_score(up, down):
    if not up:
        return 0

    n = up + down
    z = 1.64485
    phat = up / n
    return (
        phat + ((z * z) / (2 * n)) - (z * math.sqrt(((phat * (1 - phat)) + (z * z / (4 * n))) / n))
    ) / (1 + (z * z / n))


PRO_MATCHUPS_QUERY = '''
    SELECT
        b.hero_id,
        avg(a.gold_t[11]::decimal / b.gold_t[11])
        
    FROM player_matches a
    JOIN player_matches b on a.match_id = b.match_id
    
    WHERE b.is_roaming = false
    
    AND a.lane = b.lane
    AND a.lane = 2
    
    AND a.lane_role = b.lane_role
    AND a.lane_role = 2
    
    AND a.account_id != b.account_id -- Not same player
    AND (a.player_slot < 128) != (b.player_slot < 128) -- Not in same team
    AND b.gold_t[11] = (
        SELECT max(gold_t[11])
        FROM player_matches 
        WHERE match_id = a.match_id 
        AND (player_slot < 128) = (b.player_slot < 128)
    ) -- Ensure enemy is primary midlaner
    
    AND a.hero_id = {}
    
    GROUP BY b.hero_id
'''


class OpenDotaAPI:
    def __init__(self):
        self.raw_api_url = settings.OPENDOTA_API_URL
        self.api_url = settings.OPENDOTA_PUBLIC_API_URL
        self.api_key = settings.OPENDOTA_API_KEY

    def get(self, url: str, params: dict = None):
        if params is None:
            params = {}
        full_url = urljoin(self.api_url, url)
        params['api_key'] = self.api_key
        response = requests.get(full_url, params=params)
        return response.json()

    def get_heroes(self):
        return self.get('heroes')

    def get_hero_matchups(self, hero_id: int):
        matchups = self.get(f'heroes/{hero_id}/matchups')

        for matchup in matchups:
            wins = matchup['wins']
            losses = matchup['games_played'] - matchup['wins']
            matchup['advantage'] = wilson_score(wins, losses) * 100

        return matchups

    def get_hero_picture(self, full_name):
        name = slugify(full_name).replace('-', '_')
        if name in settings.OPENDOTA_IRREGULAR_NAMES:
            name = settings.OPENDOTA_IRREGULAR_NAMES[name]

        api = self.raw_api_url
        url = urljoin(api, f'apps/dota2/images/heroes/{name}_full.png')
        raw_data = requests.get(url).content
        return ContentFile(raw_data, name=f'{name}.png')

    def get_profile_info(self, steam32id):
        return self.get(f'players/{steam32id}')

    def get_pro_matchups(self, hero_id: int):
        query = PRO_MATCHUPS_QUERY.format(hero_id)

        # Also has advantage data, not super useful (too little data)
        # Wanted to keep it in the query just in case
        raw = self.get('explorer', {'sql': query})
        return [item['hero_id'] for item in raw['rows']]
