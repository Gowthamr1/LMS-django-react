from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication


def ensure_email_verified(user):
    """Allow staff accounts and verified public accounts only."""
    if not (user.is_verified or user.is_staff or user.is_superuser):
        raise AuthenticationFailed(
            'Please verify your email address before logging in.',
            code='email_not_verified',
        )


class VerifiedJWTAuthentication(JWTAuthentication):
    """Reject access tokens belonging to unverified public accounts."""

    def authenticate(self, request):
        result = super().authenticate(request)
        if result is not None:
            user, token = result
            ensure_email_verified(user)
        return result
