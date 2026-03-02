from django.db import models
from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    profile_image = models.URLField(null=True, blank=True)
    
# URL stored here
    bio = models.TextField(null=True, blank=True)
    
    REQUIRED_FIELDS = ['password','email']

    def __str__(self):
        return self.email
