from django.urls import path
from .views import register, login, auth_status, logout_view, get_post_list, create_post, get_post_by_id, delete_post

urlpatterns = [
    path("login/", login),
    path("register/", register),
    path("check-auth/", auth_status),
    path("logout/", logout_view),
    path("posts/", get_post_list),
    path("posts/create/", create_post),
    path("posts/<int:post_id>/delete/", delete_post),
    path("posts/<int:post_id>/", get_post_by_id)
]
