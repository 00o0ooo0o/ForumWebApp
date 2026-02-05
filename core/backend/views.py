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
from django_cte import With
from django.db.models import Q
from django.contrib.postgres.search import SearchQuery, SearchVector, SearchRank


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
    posts = Post.objects.select_related('author').prefetch_related('likes')
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
    post = Post.objects.select_related('author').get(id=post_id)  
    post_serializer = PostSerializer(post)

    root_comments = post.comments.select_related('author').filter(depth=0).order_by('created_at')

    comments = {
        "id": None,
        "replies": [
            {
                "id": rc.id,
                "author": rc.author.username,
                "content": rc.content,
                "depth": rc.depth,
                "descendants_count": rc.descendants_count,
                "replies": []
            }
            for rc in root_comments
        ]
    }

    return Response({
        "post": post_serializer.data,
        "comments": comments
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
    post = Post.objects.prefetch_related('likes').get(pk=post_id)

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

    parent_id = request.data.get('parent_id')
    parent_comment = None

    if parent_id:
        parent_comment = get_object_or_404(Comment, id=parent_id, post=post)

    serializer = CommentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    comment = serializer.save(author=request.user, post=post, parent=parent_comment)

    return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)


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


MAX_NESTED_REPLIES = 7

@api_view(['GET'])
def get_comment_tree(request, comment_id, **kwargs):
    limit = min(int(request.GET.get('limit', 5)), 50)
    offset = max(int(request.GET.get('offset', 0)), 0)

    root = get_object_or_404(Comment.objects.select_related('author'), pk=comment_id)

    all_replies = Comment.objects.filter(
        path__startswith=root.path
    ).select_related('author').order_by('path')


    children_map = {}
    for comment in all_replies:
        parent_id = comment.parent_id  #
        children_map.setdefault(parent_id, []).append(comment)

    def build_tree(comment):
        return {
            'id': comment.id,
            'author': comment.author.username,
            'content': comment.content,
            'created_at': comment.created_at.isoformat(),
            'depth': comment.depth,
            'descendants_count': comment.descendants_count,
            'replies': [build_tree(c) for c in children_map.get(comment.id, [])]
        }

    root_children = children_map.get(root.id, [])
    paginated_children = root_children[offset:offset+limit]
    has_more = offset + limit < len(root_children)

    tree = {
        'id': root.id,
        'author': root.author.username,
        'content': root.content,
        'created_at': root.created_at.isoformat(),
        'depth': root.depth,
        'descendants_count': root.descendants_count,
        'replies': [build_tree(c) for c in paginated_children]
    }

    return Response({
        'root_comment': tree,
        'replies': tree['replies'],
        'total_replies': len(root_children),
        'has_more': has_more
    })



@api_view(['GET'])
def get_search_results(request):
    q = request.GET.get('q', '').strip()
    try:
        limit = int(request.GET.get('limit', 10))
    except ValueError:
        limit = 10

    try:
        offset = max(int(request.GET.get('offset', 0)), 0)
    except ValueError:
        offset = 0

    if len(q) < 1:
        return Response({'results': [], 'has_more': False})

    vector = SearchVector('title')
    query = SearchQuery(q)

    qs = (Post.objects.annotate(search=vector, rank=SearchRank(vector, query))
        .filter(search=query)
        .values('id', 'title')
        .order_by('-rank')
    )

    total_count = qs.count()
    results = list(qs[offset:offset+limit])  
    has_more = offset + limit < total_count

    return Response({
        'results': results,
        'has_more': has_more
    })
