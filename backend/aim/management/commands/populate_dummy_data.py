"""
Dummy Data Management Command for AIM CMS
----------------------------------------
This Django management command populates the database with realistic dummy data for 2025,
including customers, products, sales, and orders.

Run with:
python manage.py populate_dummy_data
"""

import decimal
import random
from datetime import datetime, timedelta

from company.models import Company
from customer.models import Customer, Order, OrderItem, Transaction
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from faker import Faker
from products.models import Product
from sale.models import Sale, SaleProduct
from users.models import User


class Command(BaseCommand):
    help = "Populates the database with realistic dummy data for 2025"

    def add_arguments(self, parser):
        parser.add_argument(
            "--customers",
            type=int,
            default=100,
            help="Number of customers to create",
        )
        parser.add_argument(
            "--products",
            type=int,
            default=50,
            help="Number of products to create",
        )
        parser.add_argument(
            "--sales",
            type=int,
            default=300,
            help="Number of sales to create",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Skip confirmation prompt",
        )

    def handle(self, *args, **options):
        # Configuration
        NUM_CUSTOMERS = options["customers"]
        NUM_PRODUCTS = options["products"]
        NUM_SALES = options["sales"]
        FORCE = options["force"]

        # Date range for 2025
        START_DATE = timezone.make_aware(datetime(2025, 1, 1))
        END_DATE = timezone.make_aware(datetime(2025, 12, 31))

        # Product types
        PRODUCT_TYPES = ["TRUNK", "DRUM", "COOLER", "RING", "ANGLE"]

        # Status options for orders
        ORDER_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]

        # Initialize Faker
        fake = Faker()

        # Get the Microsoft company or create if it doesn't exist
        try:
            company = Company.objects.filter(name__icontains="Microsoft").first()

            # If Microsoft company doesn't exist, get the first company
            if not company:
                company = Company.objects.first()

            # If no company exists at all, inform the user
            if not company:
                self.stdout.write(
                    self.style.ERROR(
                        "No company found in the database. Please create a company first."
                    )
                )
                return

            # Try to find the test@test.com user or the company owner
            user = User.objects.filter(email="test@test.com").first()
            if not user:
                user = User.objects.filter(owned_company=company).first()

            if not user:
                self.stdout.write(
                    self.style.ERROR("No user found. Please create a user first.")
                )
                return

            self.stdout.write(
                self.style.SUCCESS(f"Using company: {company.name} (ID: {company.id})")
            )
            self.stdout.write(
                self.style.SUCCESS(f"Using user: {user.email} (ID: {user.id})")
            )

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error initializing data: {e}"))
            return

        # Phone number generator in Pakistan format
        def generate_phone():
            return f"+92{random.randint(300, 345)}{random.randint(1000000, 9999999)}"

        # Function to create customers with realistic Pakistani names
        def create_customers():
            self.stdout.write("Creating customers...")
            customers = []

            # Pakistani names
            first_names = [
                "Ali",
                "Ahmed",
                "Muhammad",
                "Asad",
                "Bilal",
                "Imran",
                "Kamran",
                "Hassan",
                "Farhan",
                "Zubair",
                "Amir",
                "Saad",
                "Adnan",
                "Usman",
                "Faisal",
                "Tariq",
                "Ayesha",
                "Fatima",
                "Sana",
                "Zainab",
                "Maryam",
                "Amina",
                "Hira",
                "Nadia",
                "Sadia",
                "Farah",
                "Mehwish",
                "Saima",
                "Rabia",
                "Kiran",
                "Asma",
                "Mahnoor",
            ]

            last_names = [
                "Khan",
                "Ahmed",
                "Ali",
                "Malik",
                "Qureshi",
                "Siddiqui",
                "Raza",
                "Hashmi",
                "Butt",
                "Chaudhry",
                "Shah",
                "Baig",
                "Mirza",
                "Rizvi",
                "Javed",
                "Akbar",
                "Iqbal",
                "Hassan",
                "Abbasi",
                "Aslam",
                "Farooq",
                "Shahid",
                "Bhatti",
                "Shaikh",
            ]

            with transaction.atomic():
                for _ in range(NUM_CUSTOMERS):
                    first_name = random.choice(first_names)
                    last_name = random.choice(last_names)

                    balance = decimal.Decimal(
                        str(random.uniform(-15000, 20000))
                    ).quantize(decimal.Decimal("0.01"))

                    customer = Customer.objects.create(
                        name=f"{first_name} {last_name}",
                        phone_number=generate_phone(),
                        balance=balance,
                        company=company,
                    )
                    customers.append(customer)

            self.stdout.write(self.style.SUCCESS(f"Created {len(customers)} customers"))
            return customers

        # Function to create products
        def create_products():
            self.stdout.write("Creating products...")
            products = []

            # Sample product dimensions for each type
            dimensions = {
                "TRUNK": [
                    "59 1¼ x 35",
                    "60 1¼ x 35",
                    "71 1¼ x 35",
                    "72 1¼ x 36",
                    "72 1½ x 36",
                    "60 1½ x 36",
                    "52 x 30",
                ],
                "DRUM": [
                    "23 x 23",
                    "25 x 25",
                    "25½ x 25½",
                    "29 x 29",
                    "30 x 30",
                    "31 x 31",
                    "34 x 34",
                    "35½ x 35½",
                    "37½ x 37½",
                ],
                "COOLER": ["24 x 24", "28 x 28", "32 x 32", "36 x 36", "40 x 40"],
                "RING": [
                    "6 mm 17 gauge",
                    "8 mm 18 gauge",
                    "10 mm 16 gauge",
                    "12 mm 14 gauge",
                    "14 mm 12 gauge",
                ],
                "ANGLE": [
                    "4 mm 17 gauge",
                    "5 mm 16 gauge",
                    "6 mm 15 gauge",
                    "8 mm 14 gauge",
                    "10 mm 12 gauge",
                ],
            }

            # Sample sizes
            sizes = {
                "TRUNK": ["7ft Height", "9ft Height", "12ft Height"],
                "DRUM": ["Standard", "Large", "Extra Large"],
                "COOLER": ["Standard", "Medium", "Large"],
                "RING": ["6ft set", "8ft set", "9ft set", "10ft set", "12ft set"],
                "ANGLE": ["6ft set", "8ft set", "9ft set", "10ft set", "12ft set"],
            }

            with transaction.atomic():
                for _ in range(NUM_PRODUCTS):
                    product_type = random.choice(PRODUCT_TYPES)
                    type_prefix = product_type[0]  # First letter

                    # Create a realistic name based on type and dimension
                    dimension = random.choice(dimensions[product_type])
                    size = random.choice(sizes[product_type])

                    # Create prices in Pakistani rupees (realistic pricing)
                    if product_type == "TRUNK":
                        price = decimal.Decimal(random.randint(1500, 4500))
                    elif product_type == "DRUM":
                        price = decimal.Decimal(random.randint(800, 2500))
                    elif product_type == "COOLER":
                        price = decimal.Decimal(random.randint(1200, 3000))
                    elif product_type == "RING":
                        price = decimal.Decimal(random.randint(500, 1500))
                    else:  # ANGLE
                        price = decimal.Decimal(random.randint(400, 1200))

                    # Generate stock quantity with some items low in stock
                    stock_quantity = random.choices(
                        [
                            random.randint(0, 5),  # Low stock (0-5)
                            random.randint(6, 15),  # Medium stock (6-15)
                            random.randint(16, 100),  # Good stock (16-100)
                        ],
                        weights=[0.1, 0.3, 0.6],  # Weight probabilities
                    )[0]

                    # Create the product with realistic data
                    product = Product.objects.create(
                        name=f"{type_prefix}-{dimension}",
                        price=price,
                        product_type=product_type,
                        dimensions=dimension,
                        stock_quantity=stock_quantity,
                        size=size,
                        description=f"{product_type} frame with dimensions {dimension}, {size}",
                        company=company,
                    )
                    products.append(product)

            self.stdout.write(self.style.SUCCESS(f"Created {len(products)} products"))
            return products

        # Function to create sales, orders, and transactions
        def create_sales(customers, products):
            self.stdout.write("Creating sales, orders, and transactions...")

            # Distribution of sales across months (weighted)
            # Higher weights for more recent months to show growth trend
            month_weights = {
                1: 5,  # January
                2: 6,  # February
                3: 7,  # March
                4: 7,  # April
                5: 8,  # May
                6: 9,  # June
                7: 10,  # July
                8: 11,  # August
                9: 12,  # September
                10: 13,  # October
                11: 14,  # November
                12: 15,  # December
            }

            months = []
            for month, weight in month_weights.items():
                months.extend([month] * weight)

            sales_created = 0

            with transaction.atomic():
                for _ in range(NUM_SALES):
                    # Select random customer
                    customer = random.choice(customers)

                    # Generate date with month weighting
                    month = random.choice(months)
                    day = random.randint(
                        1, 28
                    )  # Avoid dealing with month length variations
                    hours = random.randint(8, 17)  # Business hours (8am to 5pm)
                    minutes = random.randint(0, 59)
                    seconds = random.randint(0, 59)

                    sale_date = timezone.make_aware(
                        datetime(2025, month, day, hours, minutes, seconds)
                    )

                    # Generate between 1 and 5 items for this sale
                    num_items = random.choices(
                        [1, 2, 3, 4, 5],
                        weights=[
                            0.3,
                            0.3,
                            0.2,
                            0.1,
                            0.1,
                        ],  # More likely to have fewer items
                    )[0]

                    # Select random products
                    sale_products = random.sample(products, num_items)

                    # Calculate total amount
                    total_amount = decimal.Decimal("0.00")
                    items_data = []

                    for product in sale_products:
                        quantity = random.randint(1, 5)
                        price = product.price
                        item_total = price * quantity
                        total_amount += item_total

                        items_data.append(
                            {"product": product, "quantity": quantity, "price": price}
                        )

                    # Round to 2 decimal places
                    total_amount = total_amount.quantize(decimal.Decimal("0.01"))

                    # Determine amount paid (fully paid, partially paid, or unpaid)
                    payment_type = random.choices(
                        ["FULL", "PARTIAL", "NONE"],
                        weights=[
                            0.7,
                            0.2,
                            0.1,
                        ],  # 70% fully paid, 20% partially, 10% unpaid
                    )[0]

                    if payment_type == "FULL":
                        amount_paid = total_amount
                    elif payment_type == "PARTIAL":
                        # Pay between 10% and 90% of the total
                        percentage = random.randint(10, 90) / 100
                        amount_paid = (
                            total_amount * decimal.Decimal(str(percentage))
                        ).quantize(decimal.Decimal("0.01"))
                    else:  # NONE
                        amount_paid = decimal.Decimal("0.00")

                    # Create Sale
                    sale = Sale.objects.create(
                        customer=customer,
                        total_amount=total_amount,
                        amount_paid=amount_paid,
                        comments=f"Sale on {sale_date.strftime('%Y-%m-%d')}",
                        created_at=sale_date,
                        company=company,
                    )

                    # Create SaleProduct entries
                    for item_data in items_data:
                        SaleProduct.objects.create(
                            sale=sale,
                            product=item_data["product"],
                            quantity=item_data["quantity"],
                            price=item_data["price"],
                            company=company,
                        )

                    # Create Order with status based on date
                    # Older orders more likely to be delivered, recent ones pending
                    days_ago = (timezone.now() - sale_date).days

                    if days_ago > 14:  # More than 2 weeks ago
                        status_weights = [0.05, 0.05, 0.1, 0.7, 0.1]  # Mostly DELIVERED
                    elif days_ago > 7:  # Between 1-2 weeks ago
                        status_weights = [0.1, 0.2, 0.4, 0.2, 0.1]  # Mostly SHIPPED
                    else:  # Recent orders
                        status_weights = [
                            0.4,
                            0.3,
                            0.2,
                            0.05,
                            0.05,
                        ]  # Mostly PENDING/PROCESSING

                    status = random.choices(ORDER_STATUSES, weights=status_weights)[0]

                    order = Order.objects.create(
                        customer=customer,
                        total_price=total_amount,
                        status=status,
                        created_at=sale_date,
                        company=company,
                    )

                    # Create OrderItem entries directly
                    for item_data in items_data:
                        OrderItem.objects.create(
                            order=order,
                            product=item_data["product"],
                            quantity=item_data["quantity"],
                            price=item_data["price"],
                        )

                    # Create Transaction
                    if amount_paid > decimal.Decimal("0.00"):
                        transaction_status = (
                            "PAID" if amount_paid >= total_amount else "PARTIALLY_PAID"
                        )
                    else:
                        transaction_status = "UNPAID"

                    Transaction.objects.create(
                        customer=customer,
                        order=order,
                        transaction_type="DEBIT",
                        amount=total_amount,
                        status=transaction_status,
                        created_at=sale_date,
                        company=company,
                    )

                    # Update customer balance
                    customer.balance = customer.balance - (total_amount - amount_paid)
                    customer.save()

                    sales_created += 1

                    # Display progress
                    if sales_created % 20 == 0:
                        self.stdout.write(f"Created {sales_created} sales so far...")

            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully created {sales_created} sales with corresponding orders and transactions"
                )
            )

        # Ask for confirmation unless --force flag is used
        if not FORCE:
            self.stdout.write(self.style.WARNING("\n" + "=" * 60))
            self.stdout.write(
                self.style.WARNING(
                    "WARNING: This will add dummy data to your database."
                )
            )
            self.stdout.write(
                self.style.WARNING(
                    "Make sure you have a backup or are using a development environment."
                )
            )
            self.stdout.write(self.style.WARNING("=" * 60 + "\n"))

            confirm = input("Are you sure you want to continue? (yes/no): ").lower()
            if confirm not in ["yes", "y"]:
                self.stdout.write(self.style.SUCCESS("Operation cancelled."))
                return

        self.stdout.write("\nStarting data population...")

        # Create dummy data
        customers = create_customers()
        products = create_products()
        create_sales(customers, products)

        self.stdout.write(
            self.style.SUCCESS(
                "\nPopulation complete! Your database now has dummy data for 2025."
            )
        )
        self.stdout.write(self.style.SUCCESS(f"- {NUM_CUSTOMERS} customers"))
        self.stdout.write(self.style.SUCCESS(f"- {NUM_PRODUCTS} products"))
        self.stdout.write(self.style.SUCCESS(f"- {NUM_SALES} sales"))
        self.stdout.write(
            self.style.SUCCESS(
                "\nYour dashboard should now have meaningful data to display!"
            )
        )
