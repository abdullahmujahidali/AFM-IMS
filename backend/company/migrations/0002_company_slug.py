# Generated by Django 5.0.7 on 2024-08-03 14:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('company', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='company',
            name='slug',
            field=models.SlugField(blank=True, editable=False, unique=True),
        ),
    ]
