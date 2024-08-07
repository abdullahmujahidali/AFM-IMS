from rest_framework import routers
from users import views

user_router = routers.DefaultRouter()
user_router.register(r"users", views.UserViewSet)
