from django.urls import path
from .views import register, login, auth_status, logout_view, get_post_list, create_post, get_post_by_id 
from .views import delete_post, edit_post, create_comment, delete_comment, edit_comment, get_comment_replies

urlpatterns = [
    path("login/", login),
    path("register/", register),
    path("check-auth/", auth_status),
    path("logout/", logout_view),
    path("posts/", get_post_list),
    path("posts/create/", create_post),
    path("posts/<int:post_id>/delete/", delete_post),
    path("posts/<int:post_id>/edit/", edit_post),
    path("posts/<int:post_id>/", get_post_by_id),
    path('posts/<int:post_id>/comments/', create_comment),
    path('comments/<int:comment_id>/delete/', delete_comment),
    path('comments/<int:comment_id>/edit/', edit_comment),
    path('comments/<int:comment_id>/replies/', get_comment_replies)
]
