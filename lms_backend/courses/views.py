from decimal import Decimal

from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from .models import Payment
from .models import Course, Lesson, Enrollment, Review, Quiz, QuizAttempt, Question, Certificate
from .serializers import (
    CourseSerializer, LessonSerializer, EnrollmentSerializer,
    ReviewSerializer, QuizSerializer, QuizAttemptSerializer, PaymentSerializer,
    CertificateSerializer,
)
from .serializers import QuestionSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import LessonCompletion
from emailer.services import (
    send_enrollment_confirmation_email,
    send_instructor_new_enrollment_email,
    send_payment_receipt_email,
    send_course_completed_email,
    send_new_review_email,
)
from .certificate_pdf import generate_certificate_pdf


def _is_instructor_or_admin(user):
    return user.is_superuser or user.role in ('instructor', 'admin')


def _ensure_course_owner(user, course):
    """Allow admins to manage any course, but instructors only their own."""
    if not user.is_superuser and user.role != 'admin' and course.instructor_id != user.id:
        raise PermissionDenied('You can only manage content in your own courses.')


class IsInstructorOrAdmin(permissions.BasePermission):
    message = 'Only instructors can manage course content.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and _is_instructor_or_admin(request.user))


class IsStudentOrAdmin(permissions.BasePermission):
    message = 'Only students can perform this action.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or request.user.role in ('student', 'admin'))
        )


def _check_and_mark_course_completed(student, lesson):
    """
    Called whenever a LessonCompletion is created. If the student has now
    completed every lesson in the course, mark the Enrollment complete and
    send the congratulations email — but only once (guarded by checking
    enrollment.completed was False beforehand), so revisiting an already
    finished course doesn't re-send the email.
    """
    course = lesson.course
    total_lessons = course.lessons.count()
    if total_lessons == 0:
        return

    completed_count = LessonCompletion.objects.filter(
        student=student, lesson__course=course
    ).count()
    if completed_count < total_lessons:
        return

    enrollment = Enrollment.objects.filter(student=student, course=course).first()
    if enrollment and not enrollment.completed:
        # A paid course must have a successful payment before it can earn a
        # certificate. Free courses do not require a Payment record.
        if Decimal(str(course.price)) > Decimal('0') and not Payment.objects.filter(
            student=student, course=course, paid=True
        ).exists():
            return

        enrollment.completed = True
        enrollment.save(update_fields=['completed'])
        Certificate.objects.get_or_create(enrollment=enrollment)
        send_course_completed_email(enrollment)


class CourseViewSet(viewsets.ModelViewSet):
    """
    CRUD for Course. Only instructors (or admin) create courses; everyone can list/view.
    """
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsInstructorOrAdmin()]
        return [permissions.IsAuthenticated()]

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

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsInstructorOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        course_id = self.request.query_params.get('course')

        if user.role == 'instructor':
            queryset = Lesson.objects.filter(course__instructor=user)
        else:
            queryset = Lesson.objects.all()
        return queryset.filter(course_id=course_id) if course_id else queryset

    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        _ensure_course_owner(self.request.user, course)
        serializer.save()

    def perform_update(self, serializer):
        course = serializer.validated_data.get('course', serializer.instance.course)
        _ensure_course_owner(self.request.user, course)
        serializer.save()
    

class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsStudentOrAdmin()]
        if self.action in ('update', 'partial_update', 'destroy'):
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Enrollment.objects.filter(student=user)
        elif user.role == 'instructor':
            return Enrollment.objects.filter(course__instructor=user)
        return Enrollment.objects.all()

    def perform_create(self, serializer):
        if self.request.user.role != 'student' and not self.request.user.is_superuser:
            raise PermissionDenied('Only students can enroll in a course.')
        course = serializer.validated_data['course']

        if Enrollment.objects.filter(student=self.request.user, course=course).exists():
            raise ValidationError({'detail': 'Already enrolled in this course.'})

        # Paid courses can only be enrolled through the payment endpoint.
        # Free courses keep the direct-enrollment path.
        if course.price > 0 and not Payment.objects.filter(
            student=self.request.user,
            course=course,
            paid=True,
        ).exists():
            raise ValidationError({'detail': 'Complete payment before enrolling in this course.'})

        serializer.save(student=self.request.user)

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsStudentOrAdmin()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        course_id = self.request.query_params.get('course')

        # Instructors can only view reviews for courses they own, even if a
        # course filter is supplied from the browser.
        if user.role == 'instructor':
            queryset = Review.objects.filter(course__instructor=user)
            return queryset.filter(course_id=course_id).order_by('-created_at') if course_id else queryset

        # Course-detail page: anyone authenticated can see every review left on a
        # given course. This only applies to the list action with ?course=<id> —
        # retrieve/update/destroy always fall through to the role-scoped rules
        # below, so a student still can't edit or delete someone else's review.
        if self.action == 'list' and course_id:
            return Review.objects.filter(course_id=course_id).order_by('-created_at')

        if user.role == 'student':
            return Review.objects.filter(student=user)
        return Review.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role != 'student' and not self.request.user.is_superuser:
            raise PermissionDenied('Only students can leave reviews.')
        course = serializer.validated_data.get('course')
        if Review.objects.filter(student=self.request.user, course=course).exists():
            raise ValidationError({'detail': 'You have already reviewed this course. Edit or delete your existing review instead.'})
        review = serializer.save(student=self.request.user)
        send_new_review_email(review)

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsInstructorOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.role == 'instructor':
            qs = qs.filter(lesson__course__instructor=self.request.user)
        lesson_id = self.request.query_params.get('lesson')
        if lesson_id:
            qs = qs.filter(lesson_id=lesson_id)
        return qs

    def perform_create(self, serializer):
        _ensure_course_owner(self.request.user, serializer.validated_data['lesson'].course)
        serializer.save()

    def perform_update(self, serializer):
        lesson = serializer.validated_data.get('lesson', serializer.instance.lesson)
        _ensure_course_owner(self.request.user, lesson.course)
        serializer.save()


from .models import LessonCompletion

class QuizAttemptViewSet(viewsets.ModelViewSet):
    queryset = QuizAttempt.objects.all()
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return QuizAttempt.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        quiz_attempt = serializer.save(student=self.request.user)

        # A quiz is passed at 70% or higher. A lesson is complete only after
        # every quiz attached to that lesson has been passed, so a certificate
        # cannot be earned by passing just one of several required quizzes.
        total_questions = quiz_attempt.quiz.questions.count()
        passed = total_questions > 0 and (quiz_attempt.score / total_questions) >= 0.7

        if passed:
            lesson = quiz_attempt.quiz.lesson
            all_lesson_quizzes_passed = True
            for lesson_quiz in lesson.quizzes.all():
                question_count = lesson_quiz.questions.count()
                has_passing_attempt = question_count > 0 and QuizAttempt.objects.filter(
                    student=self.request.user,
                    quiz=lesson_quiz,
                    score__gte=(question_count * 0.7),
                ).exists()
                if not has_passing_attempt:
                    all_lesson_quizzes_passed = False
                    break

            if all_lesson_quizzes_passed:
                LessonCompletion.objects.get_or_create(student=self.request.user, lesson=lesson)
                _check_and_mark_course_completed(self.request.user, lesson)

        return quiz_attempt

    
    

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsInstructorOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Question.objects.all()
        if self.request.user.role == 'instructor':
            return queryset.filter(quiz__lesson__course__instructor=self.request.user)
        return queryset

    def perform_create(self, serializer):
        _ensure_course_owner(self.request.user, serializer.validated_data['quiz'].lesson.course)
        serializer.save()

    def perform_update(self, serializer):
        quiz = serializer.validated_data.get('quiz', serializer.instance.quiz)
        _ensure_course_owner(self.request.user, quiz.lesson.course)
        serializer.save()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_enrollment(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'detail': 'Course not found.'}, status=404)

    enrolled = Enrollment.objects.filter(student=request.user, course=course).exists()
    return Response({'enrolled': enrolled})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_certificates(request):
    """Return the authenticated student's issued, active certificates."""
    certificates = Certificate.objects.filter(
        enrollment__student=request.user,
        is_revoked=False,
    ).select_related('enrollment__student', 'enrollment__course__instructor').order_by('-issued_at')
    return Response(CertificateSerializer(certificates, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_certificate(request, certificate_id):
    certificate = get_object_or_404(
        Certificate.objects.select_related('enrollment__student', 'enrollment__course__instructor'),
        certificate_id=certificate_id,
        is_revoked=False,
    )
    if certificate.enrollment.student_id != request.user.id and not request.user.is_staff:
        raise PermissionDenied('You can only download your own certificate.')

    pdf = generate_certificate_pdf(certificate)
    return FileResponse(
        pdf,
        # React receives this authenticated response as a Blob and opens it
        # in the browser PDF viewer. Marking it as an attachment lets IDM
        # intercept/cancel the XHR response, leaving the viewer blank.
        as_attachment=False,
        filename=f'LMS-Certificate-{certificate.certificate_id}.pdf',
        content_type='application/pdf',
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_certificate(request, certificate_id):
    """Public endpoint used by the PDF QR code and employers/recruiters."""
    certificate = get_object_or_404(
        Certificate.objects.select_related('enrollment__student', 'enrollment__course__instructor'),
        certificate_id=certificate_id,
    )
    data = CertificateSerializer(certificate).data
    data['valid'] = not certificate.is_revoked
    return Response(data)


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        payment = serializer.save(student=self.request.user)

        # A retry returns the existing paid record. Do not send duplicate
        # receipts or enrollment notifications for that safe retry.
        if not getattr(payment, 'payment_was_created', False):
            return

        send_payment_receipt_email(payment)

        # PaymentSerializer.create() creates the Enrollment as part of the
        # same call — this is the real "student enrolled" event in the app,
        # not EnrollmentViewSet (which is only used for listing/reading).
        enrollment = Enrollment.objects.filter(
            student=payment.student, course=payment.course
        ).first()
        if enrollment:
            send_enrollment_confirmation_email(enrollment)
            send_instructor_new_enrollment_email(enrollment)
        
        
        
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    return Response({
        'username': user.username,
        'email': user.email,
        'role': user.role,
    })
