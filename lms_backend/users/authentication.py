from django.contrib.auth import get_user_model
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .jwt_authentication import ensure_email_verified


class VerifiedTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Issue JWTs only after a normal user has verified their email address."""

    def validate(self, attrs):
        data = super().validate(attrs)
        ensure_email_verified(self.user)
        return data


class VerifiedTokenObtainPairView(TokenObtainPairView):
    serializer_class = VerifiedTokenObtainPairSerializer


class VerifiedTokenRefreshSerializer(TokenRefreshSerializer):
    """Prevent a refresh token issued before verification from minting access."""

    def validate(self, attrs):
        refresh = RefreshToken(attrs['refresh'])
        user_id = refresh[api_settings.USER_ID_CLAIM]
        try:
            user = get_user_model().objects.get(**{api_settings.USER_ID_FIELD: user_id})
        except get_user_model().DoesNotExist:
            raise AuthenticationFailed('User account no longer exists.', code='user_not_found')
        ensure_email_verified(user)
        return super().validate(attrs)


class VerifiedTokenRefreshView(TokenRefreshView):
    serializer_class = VerifiedTokenRefreshSerializer
