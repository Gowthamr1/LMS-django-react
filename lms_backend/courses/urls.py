from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, LessonViewSet, EnrollmentViewSet, ReviewViewSet,
    QuizViewSet, QuizAttemptViewSet, QuestionViewSet, PaymentViewSet,
    check_enrollment, user_profile, mark_lesson_complete
)

router = DefaultRouter()
router.register('courses', CourseViewSet, basename='course')
router.register('lessons', LessonViewSet, basename='lesson')
router.register('questions', QuestionViewSet, basename='question')
router.register('enrollments', EnrollmentViewSet, basename='enrollment')
router.register('reviews', ReviewViewSet, basename='review')
router.register('quizzes', QuizViewSet, basename='quiz')
router.register('attempts', QuizAttemptViewSet, basename='quizattempt')
router.register('payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('check-enrollment/<int:course_id>/', check_enrollment, name='check-enrollment'),
    path('auth/profile/', user_profile),
    # ✅ NEW: manually mark a lesson as complete (for lessons without quizzes)
    path('lessons/<int:lesson_id>/complete/', mark_lesson_complete, name='mark-lesson-complete'),
]