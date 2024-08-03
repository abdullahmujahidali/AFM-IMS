# Generated by Django 5.0.7 on 2024-08-03 14:31

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('company', '0002_company_slug'),
    ]

    operations = [
        migrations.RenameField(
            model_name='company',
            old_name='updated_at',
            new_name='modified_at',
        ),
        migrations.AlterField(
            model_name='company',
            name='created_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AlterField(
            model_name='company',
            name='slug',
            field=models.SlugField(blank=True, unique=True),
        ),
    ]
