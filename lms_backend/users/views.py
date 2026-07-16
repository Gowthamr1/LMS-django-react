from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.generics import RetrieveUpdateDestroyAPIView
import secrets
from datetime import timedelta

from django.contrib.auth import password_validation
from django.contrib.auth.hashers import check_password, make_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from .models import PasswordChangeOTP, PendingRegistration, User
from .serializers import UserSerializer
from courses.models import Course, Review, Enrollment
from django.utils import timezone
from django.utils.timezone import now
from rest_framework.permissions import AllowAny
from rest_framework import status
from emailer.services import (
    send_welcome_email,
    send_verification_success_email,
    send_password_change_otp,
    validate_verification_otp,
)


PASSWORD_CHANGE_OTP_EXPIRY_MINUTES = 10
PASSWORD_CHANGE_OTP_MAX_ATTEMPTS = 5


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role or "student",  # fallback to student
        "is_verified": user.is_verified,
        "date_joined": user.date_joined,
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_all_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


class UserDetailView(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    print("✅ Admin dashboard stats called by:", request.user)

    users = User.objects.all()
    total_users = users.count()
    instructors = users.filter(role='instructor').count()

    courses = Course.objects.all()
    published = courses.count()
    pending = 0  # Replace with actual logic if using a 'status' field

    total_reviews = Review.objects.count()

    today = now().date()
    enrollments_today = Enrollment.objects.filter(enrolled_on__date=today).count()

    return Response({
        "total_users": total_users,
        "instructors": instructors,
        "published_courses": published,
        "pending_courses": pending,
        "total_reviews": total_reviews,
        "enrollments_today": enrollments_today,
    })



@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    username = data['username']
    email = data['email'].strip().lower()
    role = data.get('role', 'student')

    errors = {}
    if role not in ('student', 'instructor'):
        errors['role'] = ['Choose either student or instructor.']
    if User.objects.filter(email__iexact=email).exists():
        errors['email'] = ['An account with this email already exists. Please log in.']

    pending_with_username = PendingRegistration.objects.filter(username=username).first()
    pending_with_email = PendingRegistration.objects.filter(email__iexact=email).first()
    if pending_with_username and pending_with_username.email.lower() != email:
        errors['username'] = ['This username has a pending registration.']
    if pending_with_email and pending_with_email.username != username:
        errors['email'] = ['This email has a pending registration. Enter that username to resend its code.']
    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            pending, _ = PendingRegistration.objects.update_or_create(
                email=email,
                defaults={
                    'username': username,
                    'password': make_password(data['password']),
                    'role': role,
                },
            )
    except IntegrityError:
        return Response(
            {'detail': 'A registration with this username or email already exists.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not send_welcome_email(pending):
        return Response(
            {'detail': 'We could not send a verification code. Please try again shortly.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response({
        'message': 'Verification code sent. Your account will be created after verification.',
        'requires_email_verification': True,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """
    Verifies the six-digit OTP sent during registration and marks the user
    as verified. Re-submitting an already verified account is idempotent.
    """
    email = request.data.get('email', '').strip().lower()
    otp = request.data.get('otp', '').strip()
    if not email or not otp:
        return Response({'detail': 'Email and verification code are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            pending = PendingRegistration.objects.select_for_update().get(email__iexact=email)
            error = validate_verification_otp(pending, otp)
            if error:
                return Response({'detail': error}, status=status.HTTP_400_BAD_REQUEST)

            # The password was hashed when the registration became pending.
            # Only this successful OTP verification creates the real account.
            user = User.objects.create(
                username=pending.username,
                email=pending.email,
                password=pending.password,
                role=pending.role,
                is_verified=True,
            )
            pending.delete()
    except PendingRegistration.DoesNotExist:
        return Response(
            {'detail': 'No pending registration was found. Please register again.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except IntegrityError:
        return Response(
            {'detail': 'An account with these details already exists. Please log in.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    send_verification_success_email(user)
    return Response({'status': 'verified'})


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification_email(request):
    """Send a fresh OTP without exposing whether an account exists."""
    email = request.data.get('email', '').strip()
    if not email:
        return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    pending = PendingRegistration.objects.filter(email__iexact=email).first()
    if pending and not send_welcome_email(pending):
        return Response(
            {'detail': 'We could not send a verification code. Please try again shortly.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response({
        'detail': 'If this email belongs to an unverified account, a new code has been sent.'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_password_change_otp(request):
    """Validate the current password, then email a short-lived confirmation code."""
    old_password = request.data.get('old_password', '')
    if not old_password or not request.user.check_password(old_password):
        return Response({'detail': 'Your current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

    otp = f'{secrets.randbelow(1_000_000):06d}'
    PasswordChangeOTP.objects.update_or_create(
        user=request.user,
        defaults={
            'otp_hash': make_password(otp),
            'expires_at': timezone.now() + timedelta(minutes=PASSWORD_CHANGE_OTP_EXPIRY_MINUTES),
            'attempts': 0,
        },
    )

    if not send_password_change_otp(request.user, otp):
        PasswordChangeOTP.objects.filter(user=request.user).delete()
        return Response(
            {'detail': 'We could not send a password-change code. Please try again shortly.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response({'detail': 'A six-digit confirmation code was sent to your email.'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_with_otp(request):
    """Require both the current password and a valid emailed OTP before changing it."""
    old_password = request.data.get('old_password', '')
    new_password = request.data.get('new_password', '')
    otp = request.data.get('otp', '').strip()

    if not old_password or not new_password or not otp:
        return Response(
            {'detail': 'Current password, new password, and confirmation code are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not request.user.check_password(old_password):
        return Response({'detail': 'Your current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        password_validation.validate_password(new_password, request.user)
    except DjangoValidationError as error:
        return Response({'new_password': list(error.messages)}, status=status.HTTP_400_BAD_REQUEST)

    try:
        password_otp = PasswordChangeOTP.objects.get(user=request.user)
    except PasswordChangeOTP.DoesNotExist:
        return Response({'detail': 'Request a new confirmation code first.'}, status=status.HTTP_400_BAD_REQUEST)

    if timezone.now() > password_otp.expires_at:
        password_otp.delete()
        return Response({'detail': 'This confirmation code has expired. Request a new code.'}, status=status.HTTP_400_BAD_REQUEST)
    if password_otp.attempts >= PASSWORD_CHANGE_OTP_MAX_ATTEMPTS:
        password_otp.delete()
        return Response({'detail': 'Too many incorrect codes. Request a new code.'}, status=status.HTTP_400_BAD_REQUEST)
    if not otp.isdigit() or len(otp) != 6 or not check_password(otp, password_otp.otp_hash):
        password_otp.attempts += 1
        password_otp.save(update_fields=['attempts', 'created_at'])
        remaining = PASSWORD_CHANGE_OTP_MAX_ATTEMPTS - password_otp.attempts
        return Response(
            {'detail': f'Incorrect confirmation code. {remaining} attempt(s) remaining.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    request.user.set_password(new_password)
    request.user.save(update_fields=['password'])
    password_otp.delete()
    return Response({'detail': 'Password changed successfully. Please log in again.'})
