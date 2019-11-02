from .base import *


DEBUG = False
ALLOWED_HOSTS = ['web']  # Адрес контейнера - его имя
STATIC_ROOT = os.path.join(BASE_DIR, '../static')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'dotapracc-prod',
        'USER': 'ipeterov',
        'PASSWORD': r'/8Oe|7yW=jsqQ\n-*2B',
        'HOST': '51.159.25.40',
        'PORT': '38163',
        'CONN_MAX_AGE': 0,
    }
}
