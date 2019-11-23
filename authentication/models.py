from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone

from core.opendota import OpenDotaAPI


class SteamUserManager(BaseUserManager):
    def _create_user(self, steamid, password, **extra_fields):
        """
        Creates and saves a User with the given steamid and password.
        """
        try:
            # python social auth provides an empty email param, which cannot be used here
            del extra_fields['email']
        except KeyError:
            pass
        if not steamid:
            raise ValueError('The given steamid must be set')
        user = self.model(steamid=steamid, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, steamid, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(steamid, password, **extra_fields)

    def create_superuser(self, steamid, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(steamid, password, **extra_fields)


class SteamUser(AbstractBaseUser, PermissionsMixin):
    USERNAME_FIELD = 'steamid'

    steamid = models.CharField(max_length=17, unique=True)
    personaname = models.CharField(max_length=255)
    profileurl = models.CharField(max_length=300)
    avatar = models.CharField(max_length=255)
    avatarmedium = models.CharField(max_length=255)
    avatarfull = models.CharField(max_length=255)

    mmr_estimate = models.IntegerField(null=True, blank=True)

    date_joined = models.DateTimeField('date joined', default=timezone.now)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    profile_text = models.TextField(blank=True, default='')

    objects = SteamUserManager()

    def __str__(self):
        return f'{self.personaname} ({self.steamid})'

    @property
    def steam32id(self):
        as_str = str(self.steamid)
        return int(as_str[3:]) - 61197960265728

    def get_referral_registers(self):
        refs = self.referral_codes.all()
        register_counts = [ref.responses.filter(action='REGISTER').count() for ref in refs]
        return sum(register_counts)

    def get_short_name(self):
        return self.personaname

    def get_full_name(self):
        return self.personaname

    def sync_with_opendota(self):
        api = OpenDotaAPI()
        info = api.get_profile_info(self.steam32id)
        self.mmr_estimate = info.get('mmr_estimate', {}).get('estimate')
