# Generated by Django 2.2.6 on 2019-10-25 19:55

from django.conf import settings
import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Hero',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=64)),
                ('opendota_id', models.IntegerField(unique=True)),
                ('aliases', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=64, null=True), blank=True, null=True, size=None)),
                ('midlane_presence', models.FloatField(default=0)),
                ('safelane_presence', models.FloatField(default=0)),
                ('offlane_presence', models.FloatField(default=0)),
                ('jungle_presence', models.FloatField(default=0)),
                ('counters', models.ManyToManyField(blank=True, related_name='_hero_counters_+', to='core.Hero')),
                ('easy_lanes', models.ManyToManyField(blank=True, related_name='_hero_easy_lanes_+', to='core.Hero')),
            ],
        ),
        migrations.CreateModel(
            name='SelectedHero',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('add_all_mids', models.BooleanField()),
                ('add_counters', models.BooleanField()),
                ('add_easy_lanes', models.BooleanField()),
                ('hero', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='+', to='core.Hero')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='selected_heroes', to=settings.AUTH_USER_MODEL)),
                ('wanted_matchups', models.ManyToManyField(blank=True, related_name='_selectedhero_wanted_matchups_+', to='core.Hero')),
            ],
        ),
        migrations.CreateModel(
            name='HeroMatchup',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('advantage', models.FloatField()),
                ('hero', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='matchups', to='core.Hero')),
                ('other_hero', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='+', to='core.Hero')),
            ],
        ),
    ]
