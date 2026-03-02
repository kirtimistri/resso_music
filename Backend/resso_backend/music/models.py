from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class Song(models.Model):
    song_id = models.AutoField(primary_key=True, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField(null=True,blank=True)
    language = models.CharField( null=True,max_length=100, blank=True)
    lyrics = models.TextField(null=True, blank=True)  
    audio_url = models.URLField()
    artist = models.CharField(max_length=100,null=True)
    cover_url = models.URLField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_songs')

    def __str__(self):
        return f"{self.title} by {self.uploaded_by.username}"

# ❤️ LIKE MODEL (ADD THIS)
class SongLike(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="liked_songs"
    )
    song = models.ForeignKey(
        Song, on_delete=models.CASCADE, related_name="likes"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "song")  # prevents double like

    def __str__(self):
        return f"{self.user} liked {self.song.title}"
