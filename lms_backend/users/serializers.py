# backend/users/serializers.py
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # ✅ Explicit fields only — fixes the 400 on registration caused by
        # __all__ pulling in groups, user_permissions, last_login etc.
        # Also fixes the privilege escalation risk (is_staff, is_superuser
        # can no longer be passed in via the API).
        fields = ['id', 'username', 'email', 'password', 'role', 'is_active', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True},
        }
        read_only_fields = ['is_active', 'date_joined']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'student')
        )
        return user