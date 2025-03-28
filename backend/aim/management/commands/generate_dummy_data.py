import random
import uuid
from decimal import Decimal

from company.models import Company
from customer.models import Customer, Order, OrderItem, Transaction
from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker
from products.models import Product
from sale.models import Sale, SaleProduct
from usercompanyrelation.models import Role, UserCompanyRelation
from users.models import User


class Command(BaseCommand):
    help = "Generate dummy data for the application"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fake = Faker()
        # Set a seed for reproducible results
        Faker.seed(12345)
        random.seed(12345)
        # Track created objects for relationships
        self.users = []
        self.companies = []
        self.customers = []
        self.products = []
        self.sales = []
        self.orders = []

    def add_arguments(self, parser):
        parser.add_argument(
            "--users", type=int, default=50, help="Number of users to create"
        )
        parser.add_argument(
            "--companies", type=int, default=10, help="Number of companies to create"
        )
        parser.add_argument(
            "--customers",
            type=int,
            default=50,
            help="Number of customers to create per company",
        )
        parser.add_argument(
            "--products",
            type=int,
            default=50,
            help="Number of products to create per company",
        )
        parser.add_argument(
            "--sales",
            type=int,
            default=50,
            help="Number of sales to create per company",
        )

    def handle(self, *args, **options):
        num_users = options["users"]
        num_companies = options["companies"]
        num_customers = options["customers"]
        num_products = options["products"]
        num_sales = options["sales"]

        self.stdout.write(self.style.SUCCESS(f"Starting data generation process..."))

        try:
            # Ensure roles exist
            self.ensure_roles_exist()

            with transaction.atomic():
                # Generate users first
                self.generate_users(num_users)
                self.stdout.write(
                    self.style.SUCCESS(f"Generated {len(self.users)} users")
                )

                # Generate companies
                self.generate_companies(num_companies)
                self.stdout.write(
                    self.style.SUCCESS(f"Generated {len(self.companies)} companies")
                )

                # Generate user-company relations
                self.generate_user_company_relations()
                self.stdout.write(
                    self.style.SUCCESS(f"Generated user-company relations")
                )

                # For each company, generate customers, products, and sales
                for company in self.companies:
                    self.generate_customers(company, num_customers)
                    self.generate_products(company, num_products)

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Generated customers and products for all companies"
                    )
                )

                # Generate sales after all customers and products are created
                for company in self.companies:
                    company_customers = [
                        c for c in self.customers if c.company == company
                    ]
                    company_products = [
                        p for p in self.products if p.company == company
                    ]

                    if company_customers and company_products:
                        self.generate_sales(
                            company, company_customers, company_products, num_sales
                        )

                self.stdout.write(
                    self.style.SUCCESS(f"Generated sales for all companies")
                )

                # Create orders and transaction from sales
                self.generate_orders_and_transactions()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Generated orders and transactions for all sales"
                    )
                )

            self.stdout.write(
                self.style.SUCCESS("Data generation completed successfully!")
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error during data generation: {str(e)}")
            )
            raise

    def ensure_roles_exist(self):
        """Ensure all roles exist in the database"""
        roles = ["admin", "member", "owner", "finance"]
        for role in roles:
            Role.objects.get_or_create(type=role)

        self.stdout.write(self.style.SUCCESS("Roles checked and created if needed"))

    def generate_users(self, num_users):
        """Generate random users"""
        for _ in range(num_users):
            first_name = self.fake.first_name()
            last_name = self.fake.last_name()
            email = (
                f"{first_name.lower()}.{last_name.lower()}@{self.fake.domain_name()}"
            )

            # Create a real looking phone number with Pakistan format
            phone_number = f"+92{random.randint(300, 349)}{self.fake.msisdn()[6:13]}"

            user = User.objects.create(
                id=uuid.uuid4(),
                first_name=first_name,
                last_name=last_name,
                email=email,
                username=email,
                phone_number=phone_number,
                is_active=True,
            )
            user.set_password("password123")
            user.save()
            self.users.append(user)

    def generate_companies(self, num_companies):
        """Generate random companies"""
        business_types = [
            "Technologies",
            "Manufacturing",
            "Trading",
            "Solutions",
            "International",
            "Enterprises",
        ]

        for i in range(num_companies):
            # Assign an owner from the list of users
            owner = self.users[i % len(self.users)]

            # Create a realistic company name
            company_name = f"{self.fake.last_name()} {random.choice(business_types)}"

            company = Company.objects.create(
                id=uuid.uuid4(),
                name=company_name,
                owner=owner,
                status=True,  # Set all companies active
            )
            self.companies.append(company)

    def generate_user_company_relations(self):
        """Create relationships between users and companies"""
        # Get role objects
        owner_role = Role.objects.get(type="owner")
        admin_role = Role.objects.get(type="admin")
        member_role = Role.objects.get(type="member")
        finance_role = Role.objects.get(type="finance")

        # For each company, create owner relation with the company owner
        for company in self.companies:
            # Create owner relation
            UserCompanyRelation.objects.create(
                company=company, user=company.owner, role=owner_role
            )

            # Assign some users as admins, some as members, some as finance
            for user in self.users:
                # Skip if user is already the owner
                if user == company.owner:
                    continue

                # Randomly determine if this user should be part of this company (1 in 5 chance)
                if random.randint(1, 5) == 1:
                    # Randomly assign a role
                    role_choice = random.choice([admin_role, member_role, finance_role])
                    # Create the relation if it doesn't exist
                    UserCompanyRelation.objects.get_or_create(
                        company=company, user=user, defaults={"role": role_choice}
                    )

    def generate_customers(self, company, num_customers):
        """Generate customers for a company"""
        for _ in range(num_customers):
            customer_name = self.fake.name()
            phone_number = f"+92{random.randint(300, 349)}{self.fake.msisdn()[6:13]}"

            # Balance can be positive (credit) or negative (debit)
            balance = Decimal(str(random.uniform(-10000, 10000))).quantize(
                Decimal("0.01")
            )

            customer = Customer.objects.create(
                id=uuid.uuid4(),
                name=customer_name,
                phone_number=phone_number,
                balance=balance,
                company=company,
            )
            self.customers.append(customer)

    def generate_products(self, company, num_products):
        """Generate products for a company"""
        product_types = ["TRUNK", "DRUM", "COOLER", "RING", "ANGLE"]
        for _ in range(num_products):
            name = f"{random.choice(['T', 'D', 'C', 'R', 'A'])}-{random.randint(10, 99)}x{random.randint(10, 99)}"
            price = Decimal(str(random.uniform(100, 5000))).quantize(Decimal("0.01"))
            product_type = random.choice(product_types)
            dimensions = f"{random.randint(10, 100)} x {random.randint(10, 100)}"
            stock_quantity = random.randint(1, 100)
            size = (
                f"{random.randint(1, 12)}ft Height" if random.random() > 0.3 else "N/A"
            )
            description = self.fake.paragraph()

            product = Product.objects.create(
                id=uuid.uuid4(),
                name=name,
                price=price,
                product_type=product_type,
                dimensions=dimensions,
                stock_quantity=stock_quantity,
                size=size,
                description=description,
                company=company,
            )
            self.products.append(product)

    def generate_sales(self, company, customers, products, num_sales):
        """Generate sales records"""
        for _ in range(num_sales):
            # Select a random customer for this company
            customer = random.choice(customers)

            # Determine the number of products in this sale (1-5)
            num_products_in_sale = random.randint(1, 5)

            # Select random products for this sale
            sale_products = random.sample(
                products, min(num_products_in_sale, len(products))
            )

            # Calculate total amount
            total_amount = Decimal("0.00")

            # Create sale
            sale = Sale.objects.create(
                id=uuid.uuid4(),
                customer=customer,
                total_amount=Decimal("0.00"),  # Initialize to 0, will be updated
                amount_paid=Decimal("0.00"),  # Initialize to 0, will be updated
                comments=self.fake.paragraph() if random.random() > 0.7 else "",
                company=company,
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
                    company=company,
                )

                # Add to total
                total_amount += price * Decimal(quantity)

            # Update the sale with the calculated total
            amount_paid = total_amount * Decimal(random.uniform(0, 1.2)).quantize(
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
        transaction_statuses = ["PAID", "PARTIALLY_PAID", "UNPAID"]

        for sale in self.sales:
            # Create order
            order_status = random.choice(statuses)

            order = Order.objects.create(
                id=uuid.uuid4(),
                customer=sale.customer,
                total_price=sale.total_amount,
                status=order_status,
                company=sale.company,
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
                company=sale.company,
            )


if __name__ == "__main__":
    command = Command()
    command.handle()
