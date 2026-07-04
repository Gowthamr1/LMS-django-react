from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from .models import User
from .serializers import UserSerializer
from courses.models import Course, Review, Enrollment
from django.utils.timezone import now
from rest_framework.permissions import AllowAny
from rest_framework import status


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role or "student"  # fallback to student
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
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "user": UserSerializer(user).data,
            "message": "Registration successful"
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)