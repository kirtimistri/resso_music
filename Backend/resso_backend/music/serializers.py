import os
import tempfile
from datetime import timedelta
from mutagen import File as MutagenFile
import cloudinary.uploader
from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import Song
from .models import Song, SongLike
class SongUploadSerializer(serializers.ModelSerializer):
    audio_file = serializers.FileField(write_only=True)
    cover_url = serializers.URLField(required=False)  # <-- Accept frontend URL
    title = serializers.CharField(required=False)
    description = serializers.CharField(required=False)
    language = serializers.CharField(required=False)
    lyrics = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Song
        fields = ['song_id', 'title', 'description', 'language', 'uploaded_at',  
                  'audio_file', 'cover_url', 'audio_url',
                  'uploaded_by', 'lyrics']
        read_only_fields = ['song_id', 'audio_url', 'uploaded_by', 'uploaded_at']

    def create(self, validated_data):
        request = self.context['request']
        user = request.user

        audio_file = validated_data.pop('audio_file')
        cover_url = validated_data.pop('cover_url', None)

        # Upload audio
        import tempfile, os
        from mutagen import File as MutagenFile

        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.name)[1]) as temp_file:
            for chunk in audio_file.chunks():
                temp_file.write(chunk)
            temp_path = temp_file.name

        audio_upload = cloudinary.uploader.upload_large(
            temp_path, resource_type='auto', folder='songs/'
        )
        os.remove(temp_path)
        audio_url = audio_upload.get('secure_url')

        # Save song using frontend values if provided
        song = Song.objects.create(
            title=validated_data.get('title') or os.path.splitext(audio_file.name)[0],
            description=validated_data.get('description'),
            language=validated_data.get('language'),
            audio_url=audio_url,
            cover_url=cover_url,
            uploaded_by=user,
            lyrics=validated_data.get('lyrics')
        )

        return song

# serializers.py

class SongSerializer(serializers.ModelSerializer):
    is_liked = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = "__all__"

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return SongLike.objects.filter(song=obj, user=request.user).exists()
        return False

    def get_likes_count(self, obj):
        return obj.likes.count()