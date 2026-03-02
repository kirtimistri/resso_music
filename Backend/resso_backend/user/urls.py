# your_app/urls.py

from django.urls import path
from .views import RegisterView, LoginView, LogoutView, RefreshTokenView, ProfileUpdateView,ProfileView,DeleteAccountView,CurrentUserView
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete-account'),
    path("profile/", ProfileView.as_view()),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile_update'),
    path('me/',CurrentUserView.as_view(), name="current-user")
]

urlpatterns += router.urls
