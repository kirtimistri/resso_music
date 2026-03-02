from django.urls import path
from .views import request_otp, verify_otp

urlpatterns = [
    path('send-phone-otp/', request_otp),
    path('verify-phone-otp/', verify_otp),
]
