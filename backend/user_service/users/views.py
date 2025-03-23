# users/views.py
from rest_framework import generics
from django.contrib.auth.models import User
from .models import Profile
from .serializers import UserSerializer, ProfileSerializer
import secrets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from .serializers import LoginSerializer
from rest_framework.exceptions import NotFound
from django.contrib.auth import authenticate, login
from django.core.cache import cache
from rest_framework.permissions import AllowAny, IsAuthenticated
from .auth import SessionAuthentication
# API view for retrieving user details
class UserListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request,pk):
        user = User.objects.get(id=pk)
        serializer = UserSerializer(user)
        response_data = serializer.data
        response_data['is_authenticated'] = request.user.is_authenticated
        return Response(response_data, status=status.HTTP_200_OK)


class ProfileListView(generics.ListCreateAPIView):

    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

class LoginAdminAPIView(APIView):
    permission_classes = [AllowAny] 
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            # Authenticate the user
            user = authenticate(username=username, password=password)
            if user:
                if user.is_superuser:

                    # If authentication is successful, store session/token in Redis
                    # Store user id and token or session information in Redis
                    token = secrets.token_hex(32)
                    user = UserSerializer(user)
                    user_data = user.data
                    user_data['is_authenticated'] = True
                    # Optionally set an expiration time for the session
                    cache.set(f'user_session_{token}', user_data, timeout=1800)  # 1 hour

                    return Response({'message': 'Login successful', 'token': token}, status=status.HTTP_200_OK)
                else:
                    return Response({'message': 'User is not admin'}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginAPIView(APIView):
    permission_classes = [AllowAny] 
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            # Authenticate the user
            user = authenticate(username=username, password=password)
            if user:

                # If authentication is successful, store session/token in Redis
                # Store user id and token or session information in Redis
                token = secrets.token_hex(32)  # You can use Django's built-in TokenAuthentication or generate your own

                # Optionally set an expiration time for the session
                cache.set(f'user_session_{token}', user.id, timeout=1800)  # 1 hour

                return Response({'message': 'Login successful', 'token': token}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ValidateTokenAPIView(APIView):
    def get(self, request):
        token = request.headers.get('Authorization')
        if token:
            # Remove "Bearer " from token if it's present
            token = token.replace("Bearer ", "")

            # Check if the token exists in Redis cache
            user_id = cache.get(f'user_session_{token}')
            if user_id:
                # The token is valid, return user data
                user = User.objects.get(id=user_id)
                serializer = UserSerializer(user)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Session expired"}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({"message": "Token missing"}, status=status.HTTP_400_BAD_REQUEST)
