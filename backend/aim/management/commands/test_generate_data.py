import random
import uuid
from decimal import Decimal

from company.models import Company
from customer.models import Customer, Order, OrderItem, Transaction
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from products.models import Product
from sale.models import Sale, SaleProduct
from users.models import User


class Command(BaseCommand):
    help = "Generate test data for test@test.com user with Microsoft company"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set a seed for reproducible results
        random.seed(12345)
        # Store references for created objects
        self.company = None
        self.user = None
        self.customers = []
        self.products = []
        self.sales = []
        self.orders = []

    def add_arguments(self, parser):
        parser.add_argument(
            "--customers", type=int, default=20, help="Number of customers to create"
        )
        parser.add_argument(
            "--products", type=int, default=20, help="Number of products to create"
        )
        parser.add_argument(
            "--sales", type=int, default=20, help="Number of sales to create"
        )

    def handle(self, *args, **options):
        num_customers = options["customers"]
        num_products = options["products"]
        num_sales = options["sales"]

        self.stdout.write(
            self.style.SUCCESS(
                "Starting test data generation for test@test.com user..."
            )
        )

        try:
            with transaction.atomic():
                # Get or create the test user
                self.get_or_create_test_user()
                self.stdout.write(
                    self.style.SUCCESS(f"Using test user: {self.user.email}")
                )

                # Get or create the Microsoft company
                self.get_or_create_company()
                self.stdout.write(
                    self.style.SUCCESS(f"Using company: {self.company.name}")
                )

                # Generate customers for Microsoft
                self.generate_customers(num_customers)
                self.stdout.write(
                    self.style.SUCCESS(f"Generated {len(self.customers)} customers")
                )

                # Generate products for Microsoft
                self.generate_products(num_products)
                self.stdout.write(
                    self.style.SUCCESS(f"Generated {len(self.products)} products")
                )

                # Generate sales
                self.generate_sales(num_sales)
                self.stdout.write(
                    self.style.SUCCESS(f"Generated {len(self.sales)} sales")
                )

                # Generate orders and transactions from sales
                self.generate_orders_and_transactions()
                self.stdout.write(
                    self.style.SUCCESS(f"Generated orders and transactions")
                )

            self.stdout.write(
                self.style.SUCCESS("Test data generation completed successfully!")
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error during data generation: {str(e)}")
            )
            raise

    def get_or_create_test_user(self):
        """Get or create the test@test.com user"""
        try:
            self.user = User.objects.get(email="test@test.com")
            self.stdout.write(self.style.SUCCESS("Found existing test@test.com user"))
        except User.DoesNotExist:
            self.user = User.objects.create(
                id=uuid.uuid4(),
                first_name="Testing",
                last_name="User",
                email="test@test.com",
                username="test@test.com",
                is_active=True,
                is_superuser=True,
                is_staff=True,
                phone_number="+923334567890",
            )
            self.user.set_password("testpass123")
            self.user.save()
            self.stdout.write(self.style.SUCCESS("Created new test@test.com user"))

    def get_or_create_company(self):
        """Get or create the Microsoft company"""
        try:
            self.company = Company.objects.get(name="Microsoft")
            self.stdout.write(self.style.SUCCESS("Found existing Microsoft company"))
        except Company.DoesNotExist:
            self.company = Company.objects.create(
                id=uuid.uuid4(), name="Microsoft", owner=self.user, status=True
            )
            self.stdout.write(self.style.SUCCESS("Created new Microsoft company"))

    def generate_customers(self, num_customers):
        """Generate customers for Microsoft company"""
        # Common Pakistani names for more realistic data
        first_names = [
            "Ali",
            "Muhammad",
            "Ahmed",
            "Fatima",
            "Ayesha",
            "Zainab",
            "Hassan",
            "Usman",
            "Omar",
            "Bilal",
        ]
        last_names = [
            "Khan",
            "Ahmed",
            "Ali",
            "Malik",
            "Qureshi",
            "Siddiqui",
            "Shah",
            "Akhtar",
            "Baig",
            "Chaudhry",
        ]

        for i in range(num_customers):
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            name = f"{first_name} {last_name}"

            # Generate realistic Pakistani phone numbers
            phone_number = (
                f"+92{random.randint(300, 349)}{random.randint(1000000, 9999999)}"
            )

            # Some customers have positive balance, some negative
            balance = Decimal(str(random.uniform(-10000, 10000))).quantize(
                Decimal("0.01")
            )

            customer = Customer.objects.create(
                id=uuid.uuid4(),
                name=name,
                phone_number=phone_number,
                balance=balance,
                company=self.company,
            )
            self.customers.append(customer)

    def generate_products(self, num_products):
        """Generate products for Microsoft company"""
        # Product data specifically for frame manufacturing business
        product_types = ["TRUNK", "DRUM", "COOLER", "RING", "ANGLE"]
        product_prefixes = {
            "TRUNK": "T",
            "DRUM": "D",
            "COOLER": "C",
            "RING": "R",
            "ANGLE": "A",
        }

        for i in range(num_products):
            product_type = random.choice(product_types)
            prefix = product_prefixes[product_type]

            # Generate realistic dimensions based on product type
            if product_type == "TRUNK":
                dimensions = f"{random.randint(50, 80)} 1¼ x {random.randint(30, 40)}"
                size = f"{random.choice(['7ft', '9ft', '12ft'])} Height"
                price_range = (1000, 5000)
            elif product_type == "DRUM":
                dimensions = f"{random.randint(20, 40)}x{random.randint(20, 40)}"
                size = "N/A"
                price_range = (500, 2000)
            elif product_type == "COOLER":
                dimensions = f"{random.randint(20, 50)}x{random.randint(20, 50)}"
                size = f"{random.choice(['Small', 'Medium', 'Large'])}"
                price_range = (800, 3000)
            elif product_type == "RING":
                dimensions = f"{random.randint(4, 8)} mm {random.randint(16, 19)} gauge"
                size = f"{random.choice(['6ft', '8ft', '10ft'])} set"
                price_range = (500, 1500)
            else:  # ANGLE
                dimensions = f"{random.randint(3, 6)} mm {random.randint(16, 19)} gauge"
                size = f"{random.choice(['6ft', '8ft', '10ft'])} set"
                price_range = (400, 1200)

            name = f"{prefix}-{dimensions}"
            price = Decimal(str(random.uniform(*price_range))).quantize(Decimal("0.01"))
            stock_quantity = random.randint(5, 100)
            description = f"{product_type} frame {dimensions}, {size}"

            product = Product.objects.create(
                id=uuid.uuid4(),
                name=name,
                price=price,
                product_type=product_type,
                dimensions=dimensions,
                stock_quantity=stock_quantity,
                size=size,
                description=description,
                company=self.company,
            )
            self.products.append(product)

    def generate_sales(self, num_sales):
        """Generate sales records"""
        for i in range(num_sales):
            # Select a random customer
            customer = random.choice(self.customers)

            # Determine the number of products in this sale (1-5)
            num_products_in_sale = random.randint(1, 5)

            # Select random products for this sale
            sale_products = random.sample(
                self.products, min(num_products_in_sale, len(self.products))
            )

            # Calculate total amount
            total_amount = Decimal("0.00")

            # Create sale
            sale = Sale.objects.create(
                id=uuid.uuid4(),
                customer=customer,
                total_amount=Decimal("0.00"),  # Initialize to 0, will be updated
                amount_paid=Decimal("0.00"),  # Initialize to 0, will be updated
                comments=(
                    f"Sale {i+1} for {customer.name}" if random.random() > 0.7 else ""
                ),
                company=self.company,
            )

            # Create sale products
            for product in sale_products:
                quantity = random.randint(1, 10)
                price = product.price

                SaleProduct.objects.create(
                    id=uuid.uuid4(),
                    sale=sale,
                    product=product,
                    quantity=quantity,
                    price=price,
                    company=self.company,
                )

                # Add to total
                total_amount += price * Decimal(quantity)

            # Update the sale with the calculated total
            # Randomize whether this sale was fully paid, partially paid, or unpaid
            payment_ratio = random.choice(
                [0, 0.5, 1, 1.2]
            )  # 0=unpaid, 0.5=half paid, 1=fully paid, 1.2=overpaid
            amount_paid = (total_amount * Decimal(payment_ratio)).quantize(
                Decimal("0.01")
            )

            sale.total_amount = total_amount
            sale.amount_paid = amount_paid
            sale.save()

            # Update customer balance
            customer.balance -= total_amount - amount_paid
            customer.save()

            self.sales.append(sale)

    def generate_orders_and_transactions(self):
        """Generate orders and transactions from sales"""
        statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]

        for sale in self.sales:
            # Create order with a status based on how recent the sale is
            order_status = random.choice(statuses)

            order = Order.objects.create(
                id=uuid.uuid4(),
                customer=sale.customer,
                total_price=sale.total_amount,
                status=order_status,
                company=self.company,
            )
            self.orders.append(order)

            # Add order items for each sale product
            for sale_product in SaleProduct.objects.filter(sale=sale):
                OrderItem.objects.create(
                    id=uuid.uuid4(),
                    order=order,
                    product=sale_product.product,
                    quantity=sale_product.quantity,
                    price=sale_product.price,
                )

            # Determine transaction status
            if sale.amount_paid >= sale.total_amount:
                transaction_status = "PAID"
            elif sale.amount_paid > 0:
                transaction_status = "PARTIALLY_PAID"
            else:
                transaction_status = "UNPAID"

            # Create transaction
            Transaction.objects.create(
                id=uuid.uuid4(),
                customer=sale.customer,
                order=order,
                transaction_type="DEBIT",
                amount=sale.total_amount,
                status=transaction_status,
                company=self.company,
            )
