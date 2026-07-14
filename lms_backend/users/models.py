# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_verified = models.BooleanField(default=False)
    # Store only a hash of the verification code, never the code itself.
    email_verification_otp_hash = models.CharField(max_length=128, blank=True)
    email_verification_expires_at = models.DateTimeField(null=True, blank=True)
    email_verification_attempts = models.PositiveSmallIntegerField(default=0)


class PendingRegistration(models.Model):
    """Temporary signup data. It becomes a User only after OTP verification."""
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    role = models.CharField(max_length=20, choices=User.ROLE_CHOICES, default='student')
    email_verification_otp_hash = models.CharField(max_length=128, blank=True)
    email_verification_expires_at = models.DateTimeField(null=True, blank=True)
    email_verification_attempts = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
