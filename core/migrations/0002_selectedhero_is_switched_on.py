# Generated by Django 2.2.6 on 2019-11-07 00:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='selectedhero',
            name='is_switched_on',
            field=models.BooleanField(default=True),
        ),
    ]
