from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('editor.urls')),
    path('api-auth/', include('rest_framework.urls')),  # For session auth login/logout
    path('api/token/', obtain_auth_token, name='api_token_auth'),  # For token auth
]
