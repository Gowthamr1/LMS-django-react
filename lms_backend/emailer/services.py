"""
emailer/services.py

Single place for all outgoing transactional email in the app.

Design notes:
- Synchronous sending on purpose (per the plan: introduce a background worker
  only if/when volume actually requires it — premature Celery setup here
  would just be more moving parts to maintain for no current benefit).
- Every send_* function swallows and logs exceptions rather than raising.
  Email delivery must never be able to break the request that triggered it
  (e.g. a Brevo hiccup should not turn a successful enrollment into a 500).
- HTML + auto-generated plain-text fallback via EmailMultiAlternatives,
  rendered from templates/emails/*.html.
"""
import logging
import secrets
import json
from datetime import timedelta
from urllib import error, request

from django.contrib.auth.hashers import check_password, make_password
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.core.signing import BadSignature, SignatureExpired, TimestampSigner
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

# Verification links expire after this many seconds (48 hours)
VERIFICATION_TOKEN_MAX_AGE = 60 * 60 * 48
_VERIFICATION_SALT = 'emailer.verify-email'
OTP_EXPIRY_MINUTES = 10
OTP_MAX_ATTEMPTS = 5


def _send(subject, template_name, context, to_email):
    """
    Render templates/emails/<template_name>.html, build the plain-text
    fallback from it, and send via Brevo SMTP. Returns True/False instead
    of raising, so callers never need a try/except of their own.
    """
    if not to_email:
        logger.warning("Skipped sending '%s' — recipient has no email address.", subject)
        return False

    try:
        html_body = render_to_string(f'emails/{template_name}.html', context)
        text_body = strip_tags(html_body)

        if settings.BREVO_API_KEY:
            return _send_via_brevo_api(subject, html_body, text_body, to_email)

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
        )
        msg.attach_alternative(html_body, 'text/html')
        msg.send(fail_silently=False)
        return True
    except Exception:
        logger.exception("Failed to send email '%s' to %s", subject, to_email)
        return False


def _send_via_brevo_api(subject, html_body, text_body, to_email):
    """Send through Brevo's HTTPS API, avoiding blocked SMTP ports."""
    payload = {
        'sender': {
            'email': settings.DEFAULT_FROM_EMAIL,
            'name': settings.BREVO_SENDER_NAME,
        },
        'to': [{'email': to_email}],
        'subject': subject,
        'htmlContent': html_body,
        'textContent': text_body,
    }
    api_request = request.Request(
        'https://api.brevo.com/v3/smtp/email',
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'accept': 'application/json',
            'api-key': settings.BREVO_API_KEY,
            'content-type': 'application/json',
        },
        method='POST',
    )
    try:
        with request.urlopen(api_request, timeout=settings.BREVO_API_TIMEOUT) as response:
            if 200 <= response.status < 300:
                return True
            logger.error('Brevo API returned HTTP %s for %s', response.status, to_email)
    except error.HTTPError as exc:
        logger.error('Brevo API returned HTTP %s for %s', exc.code, to_email)
    except Exception:
        logger.exception('Brevo API request failed for %s', to_email)
    return False


# ── Verification tokens ──────────────────────────────────────────────

def make_verification_token(user):
    """Signed, timestamped token embedding the user's pk. No DB table needed."""
    return TimestampSigner(salt=_VERIFICATION_SALT).sign(str(user.pk))


def read_verification_token(token):
    """
    Returns the user pk (as a string) if the token is valid and not expired,
    or raises BadSignature / SignatureExpired if not — caller decides how to
    respond to each case.
    """
    return TimestampSigner(salt=_VERIFICATION_SALT).unsign(
        token, max_age=VERIFICATION_TOKEN_MAX_AGE
    )


def create_verification_otp(user):
    """Create a six-digit OTP and store only its password hash."""
    otp = f'{secrets.randbelow(1_000_000):06d}'
    user.email_verification_otp_hash = make_password(otp)
    user.email_verification_expires_at = timezone.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)
    user.email_verification_attempts = 0
    user.save(update_fields=[
        'email_verification_otp_hash',
        'email_verification_expires_at',
        'email_verification_attempts',
    ])
    return otp


def validate_verification_otp(user, otp):
    """Return an error message when an OTP cannot verify the user, else None."""
    if not isinstance(otp, str) or not otp.isdigit() or len(otp) != 6:
        return 'Enter the six-digit verification code.'
    if not user.email_verification_otp_hash or not user.email_verification_expires_at:
        return 'No active verification code. Please register again.'
    if timezone.now() > user.email_verification_expires_at:
        return 'This verification code has expired. Please register again.'
    if user.email_verification_attempts >= OTP_MAX_ATTEMPTS:
        return 'Too many incorrect attempts. Please register again.'
    if not check_password(otp, user.email_verification_otp_hash):
        user.email_verification_attempts += 1
        user.save(update_fields=['email_verification_attempts'])
        attempts_left = OTP_MAX_ATTEMPTS - user.email_verification_attempts
        return f'Incorrect verification code. {attempts_left} attempt(s) remaining.'
    return None


# ── Individual email senders ─────────────────────────────────────────

def send_welcome_email(user):
    """Register → welcome email containing a one-time verification code."""
    try:
        otp = create_verification_otp(user)
        return _send(
            subject="Welcome to LMS! 🎉",
            template_name='welcome',
            context={'user': user, 'otp': otp, 'expiry_minutes': OTP_EXPIRY_MINUTES},
            to_email=user.email,
        )
    except Exception:
        logger.exception("Failed to create a verification OTP for %s", user.email)
        return False


def send_verification_success_email(user):
    """Verify email → Verification success."""
    return _send(
        subject="Your email is verified ✅",
        template_name='verification_success',
        context={'user': user, 'frontend_url': settings.FRONTEND_URL},
        to_email=user.email,
    )


def send_enrollment_confirmation_email(enrollment):
    """Enrollment → Enrollment confirmation (to the student)."""
    course = enrollment.course
    lesson_url = f"{settings.FRONTEND_URL}/courses/{course.id}"
    return _send(
        subject=f"You're enrolled in {course.title} 🎓",
        template_name='enrollment_confirmation',
        context={'user': enrollment.student, 'course': course, 'course_url': lesson_url},
        to_email=enrollment.student.email,
    )


def send_instructor_new_enrollment_email(enrollment):
    """Instructor gets student → New enrollment notification."""
    course = enrollment.course
    instructor = course.instructor
    dashboard_url = f"{settings.FRONTEND_URL}/instructor/enrollments"
    return _send(
        subject=f"New student enrolled in {course.title} 📈",
        template_name='instructor_new_enrollment',
        context={
            'instructor': instructor,
            'student': enrollment.student,
            'course': course,
            'dashboard_url': dashboard_url,
        },
        to_email=instructor.email,
    )


def send_payment_receipt_email(payment):
    """Payment success → Receipt."""
    return _send(
        subject=f"Your receipt for {payment.course.title} 🧾",
        template_name='payment_receipt',
        context={'user': payment.student, 'payment': payment, 'course': payment.course},
        to_email=payment.student.email,
    )


def send_course_completed_email(enrollment):
    """Course completed → Congratulations."""
    course = enrollment.course
    return _send(
        subject=f"You completed {course.title}! 🏆",
        template_name='course_completed',
        context={
            'user': enrollment.student,
            'course': course,
            'browse_url': f"{settings.FRONTEND_URL}/student/browse",
        },
        to_email=enrollment.student.email,
    )


def send_new_review_email(review):
    """New review → Review notification (to the instructor)."""
    course = review.course
    instructor = course.instructor
    return _send(
        subject=f"New review on {course.title} ⭐",
        template_name='new_review',
        context={
            'instructor': instructor,
            'course': course,
            'review': review,
            'reviews_url': f"{settings.FRONTEND_URL}/instructor/reviews",
        },
        to_email=instructor.email,
    )


def send_password_change_otp(user, otp):
    """Send the one-time code required to change an authenticated user's password."""
    return _send(
        subject="Your LMS password change code",
        template_name='password_change_otp',
        context={'user': user, 'otp': otp, 'expiry_minutes': OTP_EXPIRY_MINUTES},
        to_email=user.email,
    )
