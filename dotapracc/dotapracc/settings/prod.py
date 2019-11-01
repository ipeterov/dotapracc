from .base import *


DEBUG = True
ALLOWED_HOSTS = ['dotapra.cc']
STATIC_ROOT = os.path.join(BASE_DIR, '../static')

# Database
# https://docs.djangoproject.com/en/2.2/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'bwkdyofw',
        'USER': 'bwkdyofw',
        'PASSWORD': 'TvN3hkt5muFSVVMI7eDOb6-18fcBYxbD',
        'HOST': 'balarama.db.elephantsql.com',
        'PORT': '5432',
        'CONN_MAX_AGE': 0,
    }
}
