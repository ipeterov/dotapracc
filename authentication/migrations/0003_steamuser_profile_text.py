# Generated by Django 2.2.6 on 2019-11-07 03:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0002_steamuser_mmr_estimate'),
    ]

    operations = [
        migrations.AddField(
            model_name='steamuser',
            name='profile_text',
            field=models.TextField(blank=True, default=''),
        ),
    ]
