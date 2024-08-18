# Generated by Django 5.0.7 on 2024-08-17 14:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usercompanyrelation', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usercompanyrelation',
            name='role',
            field=models.CharField(choices=[('Owner', 'Owner'), ('Admin', 'Admin'), ('Member', 'Member'), ('Finance', 'Finance')], default='Member', max_length=50),
        ),
    ]