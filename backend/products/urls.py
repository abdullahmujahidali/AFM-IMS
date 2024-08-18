from products import views
from rest_framework import routers

product_router = routers.DefaultRouter()
product_router.register(r"products", views.ProductViewSet, basename="product")
