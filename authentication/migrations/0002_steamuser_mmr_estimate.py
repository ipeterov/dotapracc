# Generated by Django 2.2.6 on 2019-11-06 12:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='steamuser',
            name='mmr_estimate',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
