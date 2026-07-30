from io import BytesIO

import qrcode
from django.conf import settings
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


def _fit_font_size(text, font_name, max_width, preferred_size, minimum_size=16):
    size = preferred_size
    while size > minimum_size and stringWidth(text, font_name, size) > max_width:
        size -= 1
    return size


def certificate_verification_url(certificate):
    return f"{settings.FRONTEND_URL.rstrip('/')}/verify-certificate/{certificate.certificate_id}"


def generate_certificate_pdf(certificate):
    """Build a polished one-page certificate in memory for secure download."""
    enrollment = certificate.enrollment
    course = enrollment.course
    student = enrollment.student
    width, height = landscape(A4)
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=(width, height))
    pdf.setTitle(f'Certificate - {course.title}')
    pdf.setAuthor('LMS')

    pdf.setFillColor(HexColor('#F8FAFC'))
    pdf.rect(0, 0, width, height, fill=1, stroke=0)
    pdf.setStrokeColor(HexColor('#1D4ED8'))
    pdf.setLineWidth(5)
    pdf.rect(24, 24, width - 48, height - 48, fill=0, stroke=1)
    pdf.setStrokeColor(HexColor('#93C5FD'))
    pdf.setLineWidth(1)
    pdf.rect(36, 36, width - 72, height - 72, fill=0, stroke=1)

    pdf.setFillColor(HexColor('#1E3A8A'))
    pdf.setFont('Helvetica-Bold', 14)
    pdf.drawCentredString(width / 2, height - 78, 'LMS LEARNING ACHIEVEMENT')
    pdf.setFillColor(HexColor('#0F172A'))
    pdf.setFont('Times-Bold', 38)
    pdf.drawCentredString(width / 2, height - 130, 'Certificate of Completion')

    pdf.setFillColor(HexColor('#475569'))
    pdf.setFont('Helvetica', 14)
    pdf.drawCentredString(width / 2, height - 172, 'This certifies that')

    name = student.get_full_name().strip() or student.username
    name_size = _fit_font_size(name, 'Times-BoldItalic', width - 180, 32)
    pdf.setFillColor(HexColor('#1D4ED8'))
    pdf.setFont('Times-BoldItalic', name_size)
    pdf.drawCentredString(width / 2, height - 220, name)
    pdf.setStrokeColor(HexColor('#60A5FA'))
    pdf.line(width / 2 - 175, height - 232, width / 2 + 175, height - 232)

    pdf.setFillColor(HexColor('#475569'))
    pdf.setFont('Helvetica', 14)
    pdf.drawCentredString(width / 2, height - 266, 'has successfully completed all course requirements for')
    course_size = _fit_font_size(course.title, 'Helvetica-Bold', width - 190, 23)
    pdf.setFillColor(HexColor('#0F172A'))
    pdf.setFont('Helvetica-Bold', course_size)
    pdf.drawCentredString(width / 2, height - 304, course.title)

    pdf.setFillColor(HexColor('#475569'))
    pdf.setFont('Helvetica', 11)
    pdf.drawCentredString(width / 2, height - 338, 'All lessons completed and required quizzes passed with 100% course progress.')

    signature_x = width / 2 - 165
    signature_y = 114
    pdf.setStrokeColor(HexColor('#94A3B8'))
    pdf.line(signature_x - 90, signature_y, signature_x + 90, signature_y)
    pdf.setFillColor(HexColor('#1E3A8A'))
    pdf.setFont('Helvetica-Oblique', 17)
    pdf.drawCentredString(signature_x, signature_y + 15, course.instructor.get_full_name().strip() or course.instructor.username)
    pdf.setFillColor(HexColor('#64748B'))
    pdf.setFont('Helvetica', 10)
    pdf.drawCentredString(signature_x, signature_y - 16, 'Instructor - Digitally Signed')

    issued_x = width / 2 + 85
    pdf.setFillColor(HexColor('#0F172A'))
    pdf.setFont('Helvetica-Bold', 11)
    pdf.drawString(issued_x, 134, 'Issued')
    pdf.setFont('Helvetica', 11)
    pdf.drawString(issued_x, 116, certificate.issued_at.strftime('%B %d, %Y'))
    pdf.setFont('Helvetica-Bold', 11)
    pdf.drawString(issued_x, 92, 'Certificate ID')
    pdf.setFont('Helvetica', 8.5)
    pdf.drawString(issued_x, 76, str(certificate.certificate_id))

    qr = qrcode.make(certificate_verification_url(certificate))
    qr_buffer = BytesIO()
    qr.save(qr_buffer, format='PNG')
    qr_buffer.seek(0)
    qr_size = 82
    qr_x = width - 145
    qr_y = 62
    pdf.drawImage(ImageReader(qr_buffer), qr_x, qr_y, qr_size, qr_size, mask='auto')
    pdf.setFillColor(HexColor('#64748B'))
    pdf.setFont('Helvetica', 8)
    pdf.drawCentredString(qr_x + qr_size / 2, qr_y - 11, 'Scan to verify')

    pdf.setFillColor(HexColor('#94A3B8'))
    pdf.setFont('Helvetica', 8)
    pdf.drawCentredString(width / 2, 51, 'This certificate can be independently verified online using its ID or QR code.')
    pdf.save()
    buffer.seek(0)
    return buffer
