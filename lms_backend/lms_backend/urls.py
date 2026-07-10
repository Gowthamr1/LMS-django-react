# backend/lms/urls.py
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import JsonResponse


def health_check(request):
    """Lightweight, public, no-DB endpoint just to check the server is awake."""
    return JsonResponse({'status': 'ok'})

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/health/', health_check, name='health-check'),
    
    
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/users/', include('users.urls')),
    path('api/courses/', include('courses.urls')),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]



