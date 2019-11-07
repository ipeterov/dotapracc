"""
Django settings for dotapracc project.

Generated by 'django-admin startproject' using Django 2.2.6.

For more information on this file, see
https://docs.djangoproject.com/en/2.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.2/ref/settings/
"""

import os

from social_core.pipeline.social_auth import social_user
from social_core.pipeline.user import get_username


# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '8l6h3bm&2_o2pjj295f(u*f+572mhdv#ds)y*+qr5t=7ca1=1t'


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'django_celery_beat',
    'channels',
    'graphene_django',
    'social_django',

    'authentication',
    'core',
    'frontend',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'dotapracc.urls'

MEDIA_URL = 'https://dotapracc.s3.amazonaws.com/'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',

                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',
            ],
        },
    },
]

WSGI_APPLICATION = 'dotapracc.wsgi.application'
ASGI_APPLICATION = 'dotapracc.routing.application'

# Password validation
# https://docs.djangoproject.com/en/2.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTHENTICATION_BACKENDS = (
    'social_core.backends.open_id.OpenIdAuth',
    'social_core.backends.steam.SteamOpenId',
    'django.contrib.auth.backends.ModelBackend',
)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'db.sqlite3',
    }
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [os.environ.get('REDISTOGO_URL')],
        },
    },
}

# Internationalization
# https://docs.djangoproject.com/en/2.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.2/howto/static-files/

STATIC_URL = '/static/'

SOCIAL_AUTH_LOGIN_REDIRECT_URL = '/'
SOCIAL_AUTH_LOGIN_ERROR_URL = '/'
SOCIAL_AUTH_POSTGRES_JSONFIELD = True
SOCIAL_AUTH_STEAM_API_KEY = '76B443C4F8CCE0375BADA98502E49A3D'
SOCIAL_AUTH_STEAM_EXTRA_DATA = ['player']

AUTH_USER_MODEL = 'authentication.SteamUser'
SOCIAL_AUTH_USER_MODEL = 'authentication.SteamUser'

SOCIAL_AUTH_PIPELINE = (
    # Get the information we can about the user and return it in a simple
    # format to create the user instance later. On some cases the details are
    # already part of the auth response from the provider, but sometimes this
    # could hit a provider API.
    'social_core.pipeline.social_auth.social_details',

    # Get the social uid from whichever service we're authing thru. The uid is
    # the unique identifier of the given user in the provider.
    'social_core.pipeline.social_auth.social_uid',

    # Verifies that the current auth process is valid within the current
    # project, this is where emails and domains whitelists are applied (if
    # defined).
    'social_core.pipeline.social_auth.auth_allowed',

    # Checks if the current social-account is already associated in the site.
    'social_core.pipeline.social_auth.social_user',

    # If there already is an account with the given steamid, pass it on to the pipeline
    'authentication.pipeline.associate_existing_user',

    # The username for the account is always the steamid
    # 'social_core.pipeline.user.get_username', # Function to get the username was changed
    'authentication.pipeline.get_username',

    # Send a validation email to the user to verify its email address.
    # Disabled by default.
    # 'social_core.pipeline.mail.mail_validation',

    # Associates the current social details with another user account with
    # a similar email address. Disabled by default.
    # 'social_core.pipeline.social_auth.associate_by_email',

    # Create a user account if we haven't found one yet.
    'social_core.pipeline.user.create_user',

    # Create the record that associates the social account with the user.
    'social_core.pipeline.social_auth.associate_user',

    # Populate the extra_data field in the social record with the values
    # specified by settings (and the default ones like access_token, etc).
    'social_core.pipeline.social_auth.load_extra_data',

    # Update the user record with any changed info from the auth service.
    # 'social_core.pipeline.user.user_details',
    # Use a custom function for this, since the details are provided separately
    'authentication.pipeline.user_details',

    # Sync with OpenDota
    'authentication.pipeline.sync_with_opendota',
)

GRAPHENE = {
    'SCHEMA': 'dotapracc.schema.schema',
}

CELERY_BROKER_URL = os.environ['REDISTOGO_URL']
CELERY_RESULT_BACKEND = os.environ['REDISTOGO_URL']

OPENDOTA_API_URL = 'https://api.opendota.com/'
OPENDOTA_PUBLIC_API_URL = f'{OPENDOTA_API_URL}api/'
OPENDOTA_API_KEY = 'fb3453ae-3631-49a9-b719-8681d4156fa8'
OPENDOTA_IRREGULAR_NAMES = {
    'io': 'wisp',
    'clockwerk': 'rattletrap',
    'doom': 'doom_bringer',
    'lifestealer': 'life_stealer',
    'magnus': 'magnataur',
    'necrophos': 'necrolyte',
    'timbersaw': 'shredder',
    'underlord': 'abyssal_underlord',
    'windranger': 'windrunner',
    'zeus': 'zuus',
    'anti_mage': 'antimage',
    'centaur_warrunner': 'centaur',
    'natures_prophet': 'furion',
    'outworld_devourer': 'obsidian_destroyer',
    'queen_of_pain': 'queenofpain',
    'shadow_fiend': 'nevermore',
    'treant_protector': 'treant',
    'vengeful_spirit': 'vengefulspirit',
    'wraith_king': 'skeleton_king',
}

DOTABUFF_URL = 'https://dotabuff.com/'
DOTABUFF_SCRAPE_USER_AGENT = (
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) '
    'AppleWebKit/537.36 (KHTML, like Gecko) '
    'Chrome/39.0.2171.95 Safari/537.36'
)

TOP_N_MATCHUPS = 5
LANE_PRESENCE_CUTOFF = 0.1

