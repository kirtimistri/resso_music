from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'phone_number',
            'bio', 'profile_image', 'is_staff', 'password'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'is_superuser': {'read_only': True},
        }

    def validate_email(self, value):
        # If creating a new user (no instance) or updating to a different email,
        # check if the email already exists.
        user = self.instance
        if User.objects.filter(email=value).exclude(pk=getattr(user, 'pk', None)).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
