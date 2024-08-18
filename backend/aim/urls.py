from company.urls import company_router
from customer.urls import customer_router
from django.contrib import admin
from django.urls import include, path
from products.urls import product_router
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from sale.urls import sales_router
from users.urls import user_router

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(company_router.urls)),
    path("api/v1/", include(product_router.urls)),
    path("api/v1/", include(user_router.urls)),
    path("api/v1/", include(customer_router.urls)),
    path("api/v1/", include(sales_router.urls)),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
