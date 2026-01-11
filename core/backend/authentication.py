# from rest_framework.decorators import api_view, permission_classes, authentication_classes
# from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
# from rest_framework.response import Response
from rest_framework import exceptions

# @api_view(['GET']) 
# @authentication_classes([])  #disable automatic auth
# @permission_classes([])     
# def JWTAuthenticationFromCookie(request):
#     token = request.COOKIES.get('access_token')#extract the token str from cookie (checking if token is in the cookies)
#     if token: #if token is in the cookies => validate 
#         auth = JWTAuthentication() #creating an object of JWTAuthentication class to use its methods
#         try:
#             #parse and validate JWT token (extract user_id from PAYLOAD)
#             #query DB for that user
#             validated_token = auth.get_validated_token(token) #extract validated token
#             user = auth.get_user(validated_token) #extract validated user from DB based on user_id  
#             request.user = user 
#         except exceptions.AuthenticationFailed:
#             return Response({'detail': 'Invalid token.'}, status=status.HTTP_401_UNAUTHORIZED)
#         return Response({'detail': 'User authenticated.'}, status=status.HTTP_200_OK)
    
#     else : #no valid token
#         return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class JWTAuthenticationFromCookie(JWTAuthentication):
    def authenticate(self, request):
        # 1. Get token from cookie (instead of Authorization header)
        token = request.COOKIES.get('access_token')
        if not token:
            return None  # no token, so no authentication done here
        
        # 2. Validate token & get user
        try:
            validated_token = self.get_validated_token(token)
            user = self.get_user(validated_token)
        except exceptions.AuthenticationFailed as e:
            raise exceptions.AuthenticationFailed('Invalid token')
        
        # 3. Return user and token for DRF
        return (user, validated_token)