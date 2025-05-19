# users/views.py
from rest_framework import generics
from django.contrib.auth.models import User,Permission
from .models import Profile
from .serializers import UserSerializer, ProfileSerializer, SignUpSerializer, UserListSerializer
import secrets
import requests
from django.contrib.auth import get_user_model
from rest_framework.decorators import  permission_classes
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

from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import get_object_or_404
from django.conf import settings


class UserListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request,pk):
        user = User.objects.get(id=pk)
        serializer = UserSerializer(user)
        response_data = serializer.data
        response_data['is_authenticated'] = request.user.is_authenticated
        return Response(response_data, status=status.HTTP_200_OK)


class UserAllListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = User.objects.all()
        print(user)
        serializer = UserListSerializer(user, many=True)
        response_data = serializer.data
        return Response(response_data, status=status.HTTP_200_OK)
# class ProfileListView(generics.ListCreateAPIView):

#     queryset = Profile.objects.all()
#     serializer_class = ProfileSerializer

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
                # if user.is_superuser:

                    # If authentication is successful, store session/token in Redis
                    # Store user id and token or session information in Redis
                    token = secrets.token_hex(32)
                    user = UserSerializer(user)
                    user_data = user.data
                    user_data['is_authenticated'] = True
                    # Optionally set an expiration time for the session
                    cache.set(f'user_session_{token}', user_data, timeout=1800)  # 1 hour
                    staff = user_data['is_staff']

                    return Response({'message': 'Login successful', 'token': token , 'staff':staff}, status=status.HTTP_200_OK)
                # else:
                #     return Response({'message': 'User is not admin'}, status=status.HTTP_401_UNAUTHORIZED)
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
            user = authenticate(username=username, password=password)
            if user:
                token = secrets.token_hex(32)
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

class SignUpAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"user": serializer.data}, status=status.HTTP_201_CREATED)

        first_error = next(iter(serializer.errors.values()))[0]
        return Response({"message": first_error}, status=status.HTTP_400_BAD_REQUEST)
class ForgotPasswordAPIView(APIView):
    permission_classes = [AllowAny] 
    def post(self, request):
        email = request.data
        user = User.objects.filter(email=email).first()

        if not user:
            return Response({"error": "Хэрэглэгч олдсонгүй."}, status=status.HTTP_400_BAD_REQUEST)

        token = default_token_generator.make_token(user)
        reset_link = f"http://localhost:3000/reset-password/{user.pk}/{token}"

        send_mail(
            "Нууц үг өөрчлөх хүсэлт",
            f"Линк дээр дарж солино уу: {reset_link}",
            settings.DEFAULT_FROM_EMAIL,
            [email],
        )

        return Response({"success": "Email-ээ шалган уу"}, status=status.HTTP_200_OK)

class ResetPassAPIView(APIView):
    permission_classes = [AllowAny] 
    def post(self, request, user_id, token):
        user = get_object_or_404(User, pk=user_id)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Token буруу."}, status=status.HTTP_400_BAD_REQUEST)

        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        if password != confirm_password:
            return Response({"error": "Нууц үг таарахгүй байна."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()
        
        return Response({"success": "Амжилттай!"}, status=status.HTTP_200_OK)

User = get_user_model() 

@permission_classes([IsAuthenticated])
class PermissionAPIView(APIView):
    def get(self,request):
        permission_ids = request.user.user_permissions
        permissions = Permission.objects.filter(id__in=permission_ids).values('codename')
        return Response({
            'permissions': permissions,
            'is_staff': request.user.is_staff,
            'is_superuser': request.user.is_superuser
        })

class PermissionUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request,pk):
        user_id = pk
        permission_codenames = request.data

        if not user_id or not isinstance(permission_codenames, list):
            return Response({"error": "Invalid data"}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        permissions = Permission.objects.filter(codename__in=permission_codenames)
        user.user_permissions.set(permissions)

        return Response({"message": "Permissions updated successfully!"})