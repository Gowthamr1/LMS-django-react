from rest_framework import serializers
from .models import Course, Lesson, Enrollment, Review, Quiz, Question, QuizAttempt, Payment
from django.utils import timezone
from .models import LessonCompletion



class LessonSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = '__all__'

    def get_progress(self, obj):
        user = self.context['request'].user
        return 100 if LessonCompletion.objects.filter(student=user, lesson=obj).exists() else 0

class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    instructor_name = serializers.ReadOnlyField(source='instructor.username')  # <-- Add this

    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['instructor', 'created_at', 'lessons']

    def get_is_enrolled(self, obj):
        user = self.context['request'].user
        return user.is_authenticated and obj.enrollments.filter(student=user).exists()

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None




class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title', read_only=True)
    student = serializers.ReadOnlyField(source='student.username')
    completed_lessons = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()
    last_accessed = serializers.SerializerMethodField()
    first_lesson_id = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = '__all__'
        extra_fields = ['course_title', 'student', 'completed_lessons', 'total_lessons', 'first_lesson_id']

    def get_completed_lessons(self, obj):
        return LessonCompletion.objects.filter(
            student=obj.student,
            lesson__course=obj.course
        ).count()

    def get_total_lessons(self, obj):
        return obj.course.lessons.count()

    def get_first_lesson_id(self, obj):
        first_lesson = obj.course.lessons.order_by('order').first()
        return first_lesson.id if first_lesson else None
    
    
    def get_last_accessed(self, obj):
        student = obj.student
        course = obj.course
        last_completion = LessonCompletion.objects.filter(
            student=student,
            lesson__course=course
        ).order_by('-completed_on').first()
        
        if last_completion:
            return last_completion.completed_on
        return None  # If no lessons accessed yet


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
        read_only_fields = ['student', 'taken_on']
        

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

        if Enrollment.objects.filter(student=student, course=course).exists():
            raise serializers.ValidationError("❌ Already enrolled.")

        payment = Payment.objects.create(
            student=student,
            course=course,
            amount=course.price,
            paid=True,  # Mock: assume payment success
            paid_on=timezone.now()
        )

        Enrollment.objects.create(student=student, course=course)
        return payment

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['message'] = "✅ Payment successful and enrollment completed."
        return data