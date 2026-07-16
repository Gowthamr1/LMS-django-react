from rest_framework import serializers
from .models import Course, Lesson, Enrollment, Review, Quiz, Question, QuizAttempt, Payment
from django.utils import timezone
from django.db import transaction
from .models import LessonCompletion


class LessonSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    perfect_score_achieved = serializers.SerializerMethodField() # ✅ MAKE SURE THIS IS HERE

    class Meta:
        model = Lesson
        fields = '__all__'

    def get_progress(self, obj):
        user = self.context['request'].user
        return 100 if LessonCompletion.objects.filter(student=user, lesson=obj).exists() else 0

    # ✅ AND MAKE SURE THIS FUNCTION IS ADDED
    def get_perfect_score_achieved(self, obj):
        user = self.context.get('request').user
        if not user or not user.is_authenticated:
            return False
            
        quizzes = obj.quizzes.all()
        if not quizzes.exists():
            return False
            
        for quiz in quizzes:
            total_qs = quiz.questions.count()
            if total_qs == 0:
                continue
            
            # Check if the user has a 100% score for this quiz
            has_perfect = QuizAttempt.objects.filter(
                student=user,
                quiz=quiz,
                score=total_qs
            ).exists()
            
            if not has_perfect:
                return False 
        
        return True


class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    instructor_name = serializers.ReadOnlyField(source='instructor.username')

    # ✅ Fixed: removed duplicate class Meta and get_is_enrolled
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['instructor', 'created_at', 'lessons']

    def get_is_enrolled(self, obj):
        user = self.context['request'].user
        return user.is_authenticated and obj.enrollments.filter(student=user).exists()

    def get_image_url(self, obj):
        if obj.external_image_url:
            return obj.external_image_url
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url') and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')
    student = serializers.ReadOnlyField(source='student.username')
    completed_lessons = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()
    last_accessed = serializers.SerializerMethodField()
    first_lesson_id = serializers.SerializerMethodField()
    next_lesson_id = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = '__all__'

    def get_completed_lessons(self, obj):
        return LessonCompletion.objects.filter(
            student=obj.student,
            lesson__course=obj.course
        ).count()

    def get_total_lessons(self, obj):
        return obj.course.lessons.count()

    def get_first_lesson_id(self, obj):
        first_lesson = obj.course.lessons.order_by('order', 'id').first()
        return first_lesson.id if first_lesson else None

    def get_next_lesson_id(self, obj):
        """Return the first course lesson the student has not completed yet."""
        completed_lesson_ids = LessonCompletion.objects.filter(
            student=obj.student,
            lesson__course=obj.course,
        ).values('lesson_id')
        next_lesson = obj.course.lessons.exclude(
            id__in=completed_lesson_ids
        ).order_by('order', 'id').first()
        return next_lesson.id if next_lesson else None

    def get_last_accessed(self, obj):
        last_completion = LessonCompletion.objects.filter(
            student=obj.student,
            lesson__course=obj.course
        ).order_by('-completed_on').first()
        return last_completion.completed_on if last_completion else None


class ReviewSerializer(serializers.ModelSerializer):
    student = serializers.ReadOnlyField(source='student.username')
    course_title = serializers.ReadOnlyField(source='course.title')

    class Meta:
        model = Review
        fields = '__all__'


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'quiz', 'text', 'choice_a', 'choice_b', 'choice_c', 'choice_d', 'correct_answer')


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ('id', 'lesson', 'title', 'questions')


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = '__all__'
        read_only_fields = ['student', 'taken_on']


class PaymentSerializer(serializers.ModelSerializer):
    course_title = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = ['id', 'student', 'course', 'amount', 'paid', 'paid_on', 'course_title']
        read_only_fields = ['student', 'amount', 'paid_on']

    def get_course_title(self, obj):
        return obj.course.title

    def create(self, validated_data):
        student = self.context['request'].user
        course = validated_data['course']

        # The current payment screen is a mock payment flow. If a browser
        # loses a successful response and retries, return the paid record
        # rather than showing a false failure or blocking the student.
        with transaction.atomic():
            payment = Payment.objects.filter(
                student=student,
                course=course,
                paid=True,
            ).order_by('id').first()

            if payment:
                Enrollment.objects.get_or_create(student=student, course=course)
                payment.payment_was_created = False
                return payment

            payment = Payment.objects.create(
                student=student,
                course=course,
                amount=course.price,
                paid=True,
                paid_on=timezone.now(),
            )
            Enrollment.objects.get_or_create(student=student, course=course)
            payment.payment_was_created = True
        return payment

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['message'] = "✅ Payment successful and enrollment completed."
        return data
