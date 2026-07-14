from django.urls import path
from .views import get_user_info, list_all_users, UserDetailView, admin_dashboard_stats
from .views import register_user, verify_email, resend_verification_email


urlpatterns = [
    path('me/', get_user_info),
    path('all/', list_all_users),
    path('<int:pk>/', UserDetailView.as_view()),  # ✅ NEW
    path('admin-stats/', admin_dashboard_stats), 
    path('register/', register_user),
    path('verify-email/', verify_email),
    path('resend-verification-email/', resend_verification_email),
]
