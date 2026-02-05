from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.db import models, transaction
from django.db.models import F, Func, Value
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.contrib import admin

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
    

class Post(models.Model):
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='posts')
    #on_delete=models.CASCADE - if user is deleted, their posts are automatically deleted
    creation_date_time = models.DateTimeField(auto_now_add=True)
    views_n = models.IntegerField(default=0)
    likes_n = models.IntegerField(default=0)
    comments_n = models.IntegerField(default=0)
    title = models.CharField(max_length=150)
    content = models.TextField()

    likes = models.ManyToManyField(CustomUser, related_name='liked_posts', blank=True)

    def add_like(self):
        self.likes_n += 1
        self.save(update_fields=['likes_n'])

    def remove_like(self, user):
        if self.likes.filter(id=user.id).exists():
            self.likes.remove(user)
            self.likes_n = self.likes.count()
            self.save(update_fields=['likes_n']) 

    def add_comment(self):
        self.comments_n += 1
        self.save(update_fields=['comments_n'])


class Comment(models.Model):
    post = models.ForeignKey(
        'Post', on_delete=models.CASCADE, related_name='comments'
    )
    author = models.ForeignKey(
        'CustomUser', on_delete=models.CASCADE
    )
    parent = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies'
    )
    path = models.TextField(db_index=True, blank=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    depth = models.PositiveIntegerField(default=0)
    descendants_count = models.PositiveIntegerField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=['post', 'path']),
        ]

    def save(self, *args, **kwargs):
        is_new = self.pk is None

        super().save(*args, **kwargs) 

        if is_new:
            if self.parent:
                self.depth = self.parent.path.count('.') + 1
                self.path = f"{self.parent.path}.{self.pk}"
            else:
                self.depth = 0
                self.path = str(self.pk)

            super().save(update_fields=['path', 'depth'])

            parent = self.parent
            while parent:
                Comment.objects.filter(pk=parent.pk).update(
                    descendants_count=F('descendants_count') + 1
                )
                parent = parent.parent

    def total_replies_count(self):
        return self.descendants_count

    def __str__(self):
        return f"Comment {self.pk} on Post {self.post.id}"

@receiver(pre_delete, sender=Comment)
def update_descendants_count_on_delete(sender, instance, **kwargs):
    total_to_remove = 1 + instance.descendants_count
    parent = instance.parent
    while parent:
        Comment.objects.filter(pk=parent.pk).update(
            descendants_count=Func(
                F('descendants_count') - total_to_remove,
                Value(0),
                function='MAX'
            )
        )
        parent = parent.parent

admin.site.register(Post)
admin.site.register(Comment)