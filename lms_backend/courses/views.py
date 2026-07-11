from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from .models import Payment
from .models import Course, Lesson, Enrollment, Review, Quiz, QuizAttempt, Question
from .serializers import (
    CourseSerializer, LessonSerializer, EnrollmentSerializer,
    ReviewSerializer, QuizSerializer, QuizAttemptSerializer, PaymentSerializer
)
from .serializers import QuestionSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import LessonCompletion


class CourseViewSet(viewsets.ModelViewSet):
    """
    CRUD for Course. Only instructors (or admin) create courses; everyone can list/view.
    """
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'instructor':
            return Course.objects.filter(instructor=user)
        return Course.objects.all()

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'instructor':
            return Lesson.objects.filter(course__instructor=user)
        return Lesson.objects.all()
    

class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Enrollment.objects.filter(student=user)
        elif user.role == 'instructor':
            return Enrollment.objects.filter(course__instructor=user)
        return Enrollment.objects.all()

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'instructor':
            return Review.objects.filter(course__instructor=user)
        elif user.role == 'student':
            return Review.objects.filter(student=user)
        return Review.objects.all()
    
    def perform_create(self, serializer):
        course = serializer.validated_data.get('course')
        if Review.objects.filter(student=self.request.user, course=course).exists():
            raise ValidationError({'detail': 'You have already reviewed this course. Edit or delete your existing review instead.'})
        serializer.save(student=self.request.user)

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        lesson_id = self.request.query_params.get('lesson')
        if lesson_id:
            qs = qs.filter(lesson_id=lesson_id)
        return qs


from .models import LessonCompletion

class QuizAttemptViewSet(viewsets.ModelViewSet):
    queryset = QuizAttempt.objects.all()
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return QuizAttempt.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        quiz_attempt = serializer.save(student=self.request.user)

        # Only mark the lesson as completed once the student scores 70% or higher
        total_questions = quiz_attempt.quiz.questions.count()
        passed = total_questions > 0 and (quiz_attempt.score / total_questions) >= 0.7

        if passed:
            lesson = quiz_attempt.quiz.lesson
            LessonCompletion.objects.get_or_create(student=self.request.user, lesson=lesson)

        return quiz_attempt

    
    

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_enrollment(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'detail': 'Course not found.'}, status=404)

    enrolled = Enrollment.objects.filter(student=request.user, course=course).exists()
    return Response({'enrolled': enrolled})


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
        
        
        
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    return Response({
        'username': user.username,
        'email': user.email,
        'role': user.role,
    })
    
    
    # ADD these imports at the top of courses/views.py (if not already there):
# from .models import LessonCompletion

# ADD this new view to courses/views.py:

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_lesson_complete(request, lesson_id):
    """
    Manually mark a lesson as complete.
    Called when student clicks 'Mark as Complete' in LessonViewer.
    Lessons with quizzes get marked automatically on quiz submit,
    but lessons WITHOUT quizzes need this endpoint.
    """
    try:
        lesson = Lesson.objects.get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({'detail': 'Lesson not found.'}, status=404)

    LessonCompletion.objects.get_or_create(student=request.user, lesson=lesson)
    return Response({'status': 'completed'})