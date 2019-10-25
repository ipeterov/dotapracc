from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import SelectedHero


@receiver(post_save, sender=SelectedHero)
def calculate_total_matchups(sender, instance, created, **kwargs):
    instance.calculate_matchups()
