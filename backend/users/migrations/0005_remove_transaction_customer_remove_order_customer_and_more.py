# Generated by Django 5.0.7 on 2024-07-24 08:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_alter_order_product_delete_product'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='transaction',
            name='customer',
        ),
        migrations.RemoveField(
            model_name='order',
            name='customer',
        ),
        migrations.RemoveField(
            model_name='order',
            name='product',
        ),
        migrations.RemoveField(
            model_name='transaction',
            name='order',
        ),
        migrations.DeleteModel(
            name='Customer',
        ),
        migrations.DeleteModel(
            name='Order',
        ),
        migrations.DeleteModel(
            name='Transaction',
        ),
    ]