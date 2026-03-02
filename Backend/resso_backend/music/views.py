from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny
from .serializers import SongUploadSerializer
from .models import Song
from .models import Song, SongLike
from .serializers import SongSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
class SongUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        # Only staff can upload songs
        if not request.user.is_staff:
            return Response(
                {"error": "Only staff users can upload songs."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validate data + file
        serializer = SongUploadSerializer(
            data=request.data,
            context={'request': request}
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            song = serializer.save()  # Save file + db entry
        except Exception as e:
            return Response(
                {"error": "Failed to upload song", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        response_data = SongUploadSerializer(song, context={'request': request}).data

        return Response({
            "message": "Song uploaded successfully.",
            "song": response_data
        }, status=status.HTTP_201_CREATED)

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer  # <-- Use this, not SongUploadSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

class ToggleSongLike(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, song_id):
        song = get_object_or_404(Song, song_id=song_id)

        like, created = SongLike.objects.get_or_create(
            user=request.user,
            song=song
        )

        if not created:
            like.delete()
            liked = False
        else:
            liked = True

        return Response({
            "liked": liked,
            "likes_count": song.likes.count()
        })