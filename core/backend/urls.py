from django.urls import path
from .views import register, login, auth_status, logout_view

urlpatterns = [
    path("login/", login),
    path("register/", register),
    path("check-auth/", auth_status),
    path("logout/", logout_view)
]
