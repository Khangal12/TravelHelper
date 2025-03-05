import secrets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from rest_framework.exceptions import NotFound
from django.contrib.auth import authenticate, login
from django.core.cache import cache
from rest_framework.permissions import AllowAny, IsAuthenticated
from .auth import SessionAuthentication

class CampByPlacesAPIView(APIView):
    authentication_classes = [SessionAuthentication]  # Use custom authentication
    permission_classes = [IsAuthenticated]  # 
    def get(self, request, pk):
        data = []
        return Response(data, status=status.HTTP_200_OK) 