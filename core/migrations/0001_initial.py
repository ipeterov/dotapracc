# Generated by Django 2.2.6 on 2019-11-05 23:43

import django.db.models.deletion
import django_fsm
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Hero',
            fields=[
                (
                    'id',
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name='ID'
                    )
                ),
                ('name', models.CharField(max_length=64)),
                ('opendota_id', models.IntegerField(unique=True)),
                ('picture', models.ImageField(upload_to='hero_images')),
                ('aliases', models.TextField(blank=True, null=True)),
                (
                    'primary_attribute',
                    models.CharField(
                        choices=[('Strength', 'Strength'), ('Intellect', 'Intellect'),
                                 ('Agility', 'Agility')],
                        max_length=9
                    )
                ),
                (
                    'attack_type',
                    models.CharField(
                        choices=[('Melee', 'Melee'), ('Ranged', 'Ranged')], max_length=6
                    )
                ),
                ('midlane_presence', models.FloatField(default=0)),
                ('safelane_presence', models.FloatField(default=0)),
                ('offlane_presence', models.FloatField(default=0)),
                ('jungle_presence', models.FloatField(default=0)),
                (
                    'counters',
                    models.ManyToManyField(
                        blank=True, related_name='_hero_counters_+', to='core.Hero'
                    )
                ),
                (
                    'easy_lanes',
                    models.ManyToManyField(
                        blank=True, related_name='_hero_easy_lanes_+', to='core.Hero'
                    )
                ),
            ],
        ),
        migrations.CreateModel(
            name='SelectedHero',
            fields=[
                (
                    'id',
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name='ID'
                    )
                ),
                (
                    'hero',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='+',
                        to='core.Hero'
                    )
                ),
                (
                    'matchups',
                    models.ManyToManyField(
                        blank=True, related_name='_selectedhero_matchups_+', to='core.Hero'
                    )
                ),
                (
                    'user',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='selected_heroes',
                        to=settings.AUTH_USER_MODEL
                    )
                ),
            ],
        ),
        migrations.CreateModel(
            name='PlayerSearch',
            fields=[
                (
                    'id',
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name='ID'
                    )
                ),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('ended_at', models.DateTimeField(blank=True, null=True)),
                ('state', django_fsm.FSMField(default='started_search', max_length=50)),
                ('channel_name', models.CharField(blank=True, max_length=64, null=True)),
                (
                    'match',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='+',
                        to='core.PlayerSearch'
                    )
                ),
                (
                    'user',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='searches',
                        to=settings.AUTH_USER_MODEL
                    )
                ),
            ],
        ),
        migrations.CreateModel(
            name='HeroMatchup',
            fields=[
                (
                    'id',
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name='ID'
                    )
                ),
                ('advantage', models.FloatField()),
                (
                    'hero',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='matchups',
                        to='core.Hero'
                    )
                ),
                (
                    'other_hero',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='+',
                        to='core.Hero'
                    )
                ),
            ],
        ),
        migrations.AddConstraint(
            model_name='playersearch',
            constraint=models.UniqueConstraint(
                condition=models.Q(state__in={'started_search', 'found_match', 'accepted_match'}),
                fields=('user', ),
                name='unique_active_search'
            ),
        ),
    ]
