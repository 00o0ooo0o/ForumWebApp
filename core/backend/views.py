from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework import exceptions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer 
from .authentication import JWTAuthenticationFromCookie

@api_view(['POST'])
def register(request):
    # Receives POST request from frontend api/register/
    # Passes data to the serializer
    # If valid → saves user
    # Returns status response 
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login(request):
    username =  request.data.get("username")
    password =  request.data.get("password")

    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = Response({"message": "Login seccessful!"}, status=status.HTTP_200_OK)
        
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=False,  
            samesite='Lax',  
            max_age=30*60
        )

        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=7*24*60*60 
        )
        return response
    else:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@authentication_classes([JWTAuthenticationFromCookie])
@permission_classes([IsAuthenticated])
def auth_status(request):
    return Response({'authenticated': True, 'username': request.user.username})

@csrf_exempt
@api_view(['POST'])
def logout_view(request):
    response = JsonResponse({'message': 'Logged out successfully'})
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    return response
    
    #NOTES
# get the Authorization header manually
# auth_header = request.headers.get('Authorization')
# get token from a cookie
# token = request.COOKIES.get('access_token')

