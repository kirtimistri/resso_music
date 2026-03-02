from django.core.mail import send_mail
import random
from django.conf import settings

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(email, otp):
    subject = 'Your OTP Code'
    send_mail(
    subject="Your OTP",
    message = f'Your OTP code is {otp}. It is valid for 10 minutes.',
    
    from_email=settings.EMAIL_HOST_USER,
    recipient_list=[email],
)

