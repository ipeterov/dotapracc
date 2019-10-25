# Generated by Django 2.2.6 on 2019-10-25 12:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_auto_20191025_1103'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='hero',
            name='is_traditional_mid',
        ),
        migrations.AddField(
            model_name='hero',
            name='jungle_presence',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='hero',
            name='midlane_presence',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='hero',
            name='offlane_presence',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='hero',
            name='safelane_presence',
            field=models.FloatField(default=0),
        ),
    ]
