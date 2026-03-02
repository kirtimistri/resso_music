from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .models import EmailOTP
from rest_framework_simplejwt.tokens import RefreshToken

from .utils import generate_otp, send_otp_email  # Create a utils.py file
User = get_user_model()

class SendEmailOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=400)

        otp = generate_otp()
        EmailOTP.objects.create(email=email, otp=otp)
        send_otp_email(email, otp)

        return Response({"message": "OTP sent to email"}, status=200)

class VerifyEmailOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response({"error": "Email and OTP are required"}, status=400)

        try:
            email_otp = EmailOTP.objects.get(email=email, otp=otp, is_verified=False)
        except EmailOTP.DoesNotExist:
            return Response({"error": "Invalid OTP"}, status=400)

        # Mark OTP as used/verified
        email_otp.is_verified = True
        email_otp.save()

        return Response({"message": "OTP verified"}, status=200)