from django.shortcuts import render
from django.http import HttpResponse

def LoginView(request):
    return HttpResponse("Log In")