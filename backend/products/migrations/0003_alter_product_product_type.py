# Generated by Django 5.0.7 on 2024-07-24 08:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_product_dimensions_product_product_type_product_size'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='product_type',
            field=models.CharField(choices=[('FRAME', 'Trunk Frame'), ('DRUM', 'Drum Frame'), ('COOLER', 'Cooler Frame'), ('RING', 'Ring Frame'), ('ANGLE', 'Angle')], default='FRAME', max_length=20),
        ),
    ]
