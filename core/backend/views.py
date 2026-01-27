from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework import status, viewsets
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import exceptions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.views.decorators.http import require_GET
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from .serializers import RegisterSerializer, PostSerializer, CommentSerializer
from .models import Post, Comment
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




@api_view(['GET'])
def get_post_list(request):
    posts = Post.objects.all()
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_post(request):
    serializer = PostSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_post_by_id(request, post_id):
    try: 
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=404)
    
    post_serializer = PostSerializer(post)
    root_comments = post.comments.filter(parent__isnull=True)
    comment_serializer = CommentSerializer(root_comments, many=True, context={'request': request})

    return Response({
        "post": post_serializer.data,
        "comments": comment_serializer.data
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_post(request, post_id):
    post = get_object_or_404(Post, pk=post_id)
    if post.author != request.user:
        return Response(
            {"detail": "You do not have permission to delete this post"},
            status=403
        )
    post.delete()
    return Response(status=204)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def edit_post(request, post_id):
    post = get_object_or_404(Post, pk=post_id)

    if 'like' in request.data:
        if request.user in post.likes.all():
            post.likes.remove(request.user)
            liked = False
        else:
            post.likes.add(request.user)
            liked = True

        post.likes_n = post.likes.count()
        post.save(update_fields=['likes_n'])
        serializer = PostSerializer(post)
        return Response({'liked': liked, 'likes_count': post.likes_n, 'post': serializer.data}, status=200)

    if post.author != request.user:
        return Response(
            {"detail": "You do not have permission to edit this post"}, status=403)
    
    serializer = PostSerializer(post, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comment(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    parent = None
    parent_id = request.data.get('parent_id')
    if parent_id:
        parent = get_object_or_404(Comment, id=parent_id, post=post)

    serializer = CommentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(
            author=request.user,
            post=post,
            parent=parent  
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, comment_id):
    comment = get_object_or_404(Comment, pk=comment_id)
    if comment.author != request.user:
        return Response(
            {"detail": "You do not have permission to delete this comment"},
            status=403
        )
    comment.delete()
    return Response(status=204)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def edit_comment(request, comment_id):
    comment = get_object_or_404(Comment, pk=comment_id)
    if comment.author != request.user:
        return Response(
            {"detail": "You do not have permission to edit this comment"},
            status=403
        )
    serializer = CommentSerializer(comment, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_comment_replies(request, comment_id):
    limit = min(int(request.GET.get('limit', 5)), 50)
    offset = max(int(request.GET.get('offset', 0)), 0)
    parent = get_object_or_404(Comment, pk=comment_id)
    queryset = Comment.objects.filter(parent_id=comment_id).order_by('created_at')
    total = queryset.count()
    replies = queryset[offset:offset + limit]
    serializer = CommentSerializer(replies, many=True)
    return Response({"results": serializer.data, "has_more": offset + limit < total, "total_count": total})