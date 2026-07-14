from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from django.contrib.auth.hashers import make_password
from django.db import IntegrityError, transaction
from .models import PendingRegistration, User
from .serializers import UserSerializer
from courses.models import Course, Review, Enrollment
from django.utils.timezone import now
from rest_framework.permissions import AllowAny
from rest_framework import status
from emailer.services import (
    send_welcome_email,
    send_verification_success_email,
    validate_verification_otp,
)


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
