from .base import *


DEBUG = True
ALLOWED_HOSTS = ['localhost']
INTERNAL_IPS = ['127.0.0.1']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'dotapracc-dev',
        'USER': 'ipeterov',
        'PASSWORD': r'/8Oe|7yW=jsqQ\n-*2B',
        'HOST': '51.159.25.40',
        'PORT': '38163',
        'CONN_MAX_AGE': 0,
    }
}
