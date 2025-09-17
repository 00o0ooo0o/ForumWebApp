# Takes JSON data (email, username, password)
# Validates if unique(email, username)
# Hashes the password (so it's not stored as plain text)
# Returns only safe fields in response

from rest_framework import serializers
from .models import CustomUser

class RegisterSerializer(serializers.ModelSerializer):
    #       ModelSerializer parent-class:
    # It will automatically generate a set of fields for you, based on the model.
    # It will automatically generate validators for the serializer
    # It includes simple default implementations of .create() and .update()
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password'] #or = '__all__' / exclude = ['...', ...]

    def create(self, validated_data):
        user = CustomUser(
            email=validated_data['email'],
            username=validated_data['username']
        )
        user.set_password(validated_data['password']) #password is hashed before saving
        user.save()
        return user