from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SongUploadView, SongViewSet
from music.views import ToggleSongLike
router = DefaultRouter()
router.register(r'songs', SongViewSet, basename='song')

urlpatterns = [
    path('upload/', SongUploadView.as_view(), name='song-upload'),
    path('songs/<int:song_id>/like/', ToggleSongLike.as_view(), name='toggle-song-like'),
    path('', include(router.urls)),  # CRUD endpoints for songs
]
