from rest_framework import routers

from products import views

product_router = routers.DefaultRouter()
product_router.register(r"", views.ProductViewSet)
