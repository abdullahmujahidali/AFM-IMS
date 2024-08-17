from company import views
from rest_framework import routers

company_router = routers.DefaultRouter()
company_router.register(r"company", views.CompanyViewSet)
