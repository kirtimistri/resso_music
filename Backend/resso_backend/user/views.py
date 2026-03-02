import cloudinary
from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework import status, generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from cloudinary.uploader import upload as cloudinary_upload
from cloudinary.exceptions import Error as CloudinaryError
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken, TokenError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from emailOTP.models import EmailOTP
from emailOTP.utils import generate_otp, send_otp_email
from phoneOTP.models import PhoneOTP
from .models import User
from .serializers import UserSerializer
from .authentication import CookieJWTAuthentication

# Detect dev mode
IS_DEV = settings.DEBUG
SECURE_COOKIE = not IS_DEV
SAMESITE = "Lax" if IS_DEV else "None"


class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        password = self.request.data.get('password')
        user = serializer.save()
        if password:
            user.set_password(password)
            user.save()


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"error": "Refresh token missing"}, status=401)

        try:
            refresh = RefreshToken(refresh_token)
            new_access = refresh.access_token

            response = Response({"message": "Token refreshed"})
            response.set_cookie(
               "access_token",
                str(new_access),
                httponly=True,
                secure=SECURE_COOKIE,
                samesite=SAMESITE,
                path="/"
            )
            return response
        except TokenError:
            return Response({"error": "Invalid refresh token"}, status=401)


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer
    parser_classes = [MultiPartParser, JSONParser, FormParser]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        email = data.get('email')
        phone_number = data.get('phone_number')
        otp = data.get('otp')

        if not email and not phone_number:
            return Response({"error": "Either email or phone number is required"}, status=400)

        # Email OTP
        if email:
            try:
                otp_record = EmailOTP.objects.filter(email=email, otp=otp, is_verified=True).latest('created_at')
            except EmailOTP.DoesNotExist:
                return Response({"error": "Invalid or unverified email OTP"}, status=400)
            if User.objects.filter(email=email).exists():
                return Response({"error": "Email already registered"}, status=400)

        # Phone OTP
        if phone_number:
            try:
                otp_record = PhoneOTP.objects.filter(phone_number=phone_number, otp=otp, is_verified=True).latest('created_at')
            except PhoneOTP.DoesNotExist:
                return Response({"error": "Invalid or unverified phone OTP"}, status=400)
            if User.objects.filter(phone_number=phone_number).exists():
                return Response({"error": "Phone number already registered"}, status=400)

        # Cloudinary upload
        profile_image = data.get('profile_image')
        if profile_image:
            try:
                upload_result = cloudinary.uploader.upload(profile_image, folder="user")
                data['profile_url'] = upload_result.get('secure_url')
            except Exception as e:
                return Response({"error": "Image upload failed", "details": str(e)}, status=500)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        password = data.get('password')
        if password:
            user.set_password(password)
            user.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        response = Response({
            "message": "User registered and logged in",
            "user": serializer.data
        }, status=201)

        response.set_cookie('access_token',
                             str(access_token),
                               secure=True,
                samesite="None", httponly=True
                , path='/')
        response.set_cookie('refresh_token', str(refresh) ,secure=True, httponly=True,
                samesite="None",
                
                path='/')

        return response

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            username = request.data.get("username")
            password = request.data.get("password")

            if not username or not password:
                return Response({"error": "Username and password are required"}, status=400)

            user = authenticate(username=username, password=password)
            if not user:
                return Response({"error": "Invalid credentials"}, status=401)

            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token

            response = Response({
                "message": "Login successful",
                "user": UserSerializer(user).data
            }, status=200)
            response.set_cookie(
                "access_token",
                str(access_token),
                httponly=True,
                secure=SECURE_COOKIE,
                samesite=SAMESITE,
                path="/"
            )

            response.set_cookie(
                "refresh_token",
                str(refresh),
                httponly=True,
                secure=SECURE_COOKIE,
                samesite=SAMESITE,
                path="/"
            )

            return response

        except Exception as e:
            import traceback
            print("LoginView Exception:", traceback.format_exc())
            return Response({"error": "Server error", "details": str(e)}, status=500)

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        response = Response({"message": "Logged out"}, status=200)

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass  # 🔥 DO NOT BREAK LOGOUT

        response.delete_cookie("access_token", path="/")
        response.delete_cookie("refresh_token", path="/")

        return response


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()

        response = Response({"message": "Account deleted successfully"}, status=200)
        response.delete_cookie("access_token", path="/")
        response.delete_cookie("refresh_token", path="/")
        return response

class ProfileView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class ProfileUpdateView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def put(self, request):
        user = request.user
        data = request.data.copy()

        # ✅ Handle profile image upload
        if 'profile_image' in request.FILES:
            try:
                result = cloudinary_upload(
                    request.FILES['profile_image'],
                    folder="profile_images"
                )
                # 🔥 USE SAME FIELD NAME EVERYWHERE
                data['profile_image'] = result.get('secure_url')
            except CloudinaryError as e:
                return Response(
                    {'error': 'Cloudinary upload failed', 'details': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = UserSerializer(user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        print("Profile updated:", serializer.data)

        # 🔥 RETURN SERIALIZER DATA DIRECTLY
        return Response(serializer.data, status=status.HTTP_200_OK)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
