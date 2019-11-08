# Generated by Django 2.2.6 on 2019-11-08 19:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_selectedhero_is_switched_on'),
    ]

    operations = [
        migrations.CreateModel(
            name='BotAccount',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('login', models.CharField(max_length=64)),
                ('password', models.CharField(max_length=128)),
                ('is_busy', models.BooleanField()),
            ],
        ),
    ]
