from django.http import JsonResponse
from .models import PhoneOTP
from user.models import User
from .utils import generate_otp, send_otp_via_sms
from django.utils import timezone
from datetime import timedelta
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def request_otp(request):
    try:
        data = json.loads(request.body)
        phone = data.get("phone")

        if not phone:
            return JsonResponse({"error": "Phone number required"}, status=400)

        otp = generate_otp()
        send_otp_via_sms(phone, otp)  # This is likely where error happens
        PhoneOTP.objects.create(phone_number=phone, otp=otp)
        return JsonResponse({"message": "OTP sent to phone"})

    except Exception as e:
        logger.error(f"Error sending OTP: {e}", exc_info=True)
        return JsonResponse({"error": "Failed to send OTP", "details": str(e)}, status=500)

@csrf_exempt
def verify_otp(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests allowed"}, status=405)

    try:
        body = json.loads(request.body)
        phone = body.get("phone")
        otp_input = body.get("otp")
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    if not phone or not otp_input:
        return JsonResponse({"error": "Phone and OTP required"}, status=400)

    try:
        otp_obj = PhoneOTP.objects.filter(phone_number=phone).latest("created_at")
        now = timezone.now()

        if otp_obj.otp == otp_input and now - otp_obj.created_at < timedelta(minutes=5):
            otp_obj.is_verified = True    # Mark OTP as verified here
            otp_obj.save()

            user, created = User.objects.get_or_create(phone_number=phone)
            if created:
                user.username = phone  # Set default username if new
                user.save()
            return JsonResponse({"message": "Authenticated", "user_id": user.id}, status=200)
        else:
            return JsonResponse({"error": "Invalid or expired OTP"}, status=400)

    except PhoneOTP.DoesNotExist:
        return JsonResponse({"error": "OTP not found"}, status=400)
