from rest_framework import serializers
from .models import CustomUser, Post, Comment

class RegisterSerializer(serializers.ModelSerializer):
    # Takes JSON data (email, username, password)
    # Validates if unique(email, username)
    # Hashes the password (so it's not stored as plain text)
    # Returns only safe fields in response

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
    
    

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.username', read_only=True)
    post = serializers.CharField(source='post.id', read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta: 
        model = Comment
        fields = ['id', 'post', 'author', 'parent', 'content', 'created_at', 'replies']

    def create(self, validated_data):
        user = self.context['request'].user  
        comment = Comment.objects.create(author=user, **validated_data)
        return comment
    
    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("Comment content cannot be empty")
        return value
    
    def get_replies(self, obj):
        serializer = CommentSerializer(obj.replies.all(), many=True)
        return serializer.data
    

    
class PostSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.username', read_only=True)

    likes_n = serializers.IntegerField(read_only=True)
    views_n = serializers.IntegerField(read_only=True)
    comments_n = serializers.IntegerField(read_only=True)

    comments = CommentSerializer(many=True, read_only=True) 

    class Meta: 
        model = Post
        fields = ['id', 'author', 'theme', 'title', 'content',
    'likes_n', 'comments_n', 'views_n', 'creation_date_time', 'comments']

    def create(self, validated_data):
        user = self.context['request'].user  
        post = Post.objects.create(author=user, **validated_data)
        return post
    
    def validate_title(self, value):
        if not value.strip(): # .strip() removes blank spaces
            raise serializers.ValidationError("Post title cannot be empty")
        return value

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("Post content cannot be empty")
        return value
