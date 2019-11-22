import requests
from bs4 import BeautifulSoup
from django.conf import settings
from requests.compat import urljoin

LANES = ('mid', 'safe', 'off', 'jungle')


class DotaBuffAPI:
    def __init__(self):
        self.url = settings.DOTABUFF_URL

    def get(self, url, params=None):
        if params is None:
            params = {}
        full_url = urljoin(self.url, url)
        headers = {'User-Agent': settings.DOTABUFF_SCRAPE_USER_AGENT}
        response = requests.get(full_url, params=params, headers=headers)
        return BeautifulSoup(response.text, 'html.parser')

    def get_lane_meta(self, lane):
        assert lane in LANES

        root = self.get('heroes/lanes', {'lane': lane})
        heroes_table = root.find('table').find('tbody')
        meta_dict = {}
        for row in heroes_table.find_all('tr'):
            cols = row.find_all('td')
            _, name_td, meta_td, *_ = cols
            name = name_td.text
            meta = float(meta_td.text.rstrip('%')) / 100
            meta_dict[name] = meta
        return meta_dict
