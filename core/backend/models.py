from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, username, password, **extra_fields):
        if not username:
            raise ValueError('Users must have an email address')

        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=30, unique=True)
    email = models.EmailField(unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = [] #USERNAME_FIELD, password are required by default

    def __str__(self):
        return self.email
    
class Theme(models.TextChoices):
    # = 'value', 'human readable name'
    CAT_CHAT = 'cat_chat', 'Cat Chat' 
    BEHAVIOUR = 'behaviour', 'Behavior'
    HEALTH_AND_NUTRITION = 'health_and_nutrition', 'Health and Nutrition'
    CAT_EMERGENCIES = 'cat_emergencies', 'Cat Emergencies'
    CATS_IN_NEED = 'cats_in_need', 'Cats In Need'


class Post(models.Model):
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='posts')
    #on_delete=models.CASCADE - if user is deleted, their posts are automatically deleted
    theme = models.CharField(max_length=20, choices=Theme.choices, default=Theme.CAT_CHAT)
    creation_date_time = models.DateTimeField(auto_now_add=True)
    views_n = models.IntegerField(default=0)
    likes_n = models.IntegerField(default=0)
    comments_n = models.IntegerField(default=0)
    title = models.CharField(max_length=150)
    content = models.TextField()

    def increment_views(self):
        self.views_n += 1
        self.save(update_fields=['views_n'])

    def add_like(self):
        self.likes_n += 1
        self.save(update_fields=['likes_n'])

    def add_comment(self):
        self.comments_n += 1
        self.save(update_fields=['comments_n'])



class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='replies'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def is_root(self):
        return self.parent is None

    def replies_count(self):
        return self.replies.count()
    
    def get_replies(self):
        return self.replies.all()


