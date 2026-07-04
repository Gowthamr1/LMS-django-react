from django.contrib import admin
from .models import Course, Lesson, Enrollment, Review, Payment, Quiz, Question, QuizAttempt

admin.site.register(Course)
admin.site.register(Lesson)
admin.site.register(Enrollment)
admin.site.register(Review)
admin.site.register(Payment)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(QuizAttempt)
