import secrets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Camp, Place,Room
from .serializers import CampSerializer, PlaceSerializer,CampDetailSerializer, LoginSerializer,RoomSerializer
from django.http import JsonResponse
from rest_framework.exceptions import NotFound
from django.contrib.auth import authenticate, login
from django.core.cache import cache
from rest_framework.permissions import AllowAny, IsAuthenticated
from .auth import SessionAuthentication
from django.db.models import Q
import os

class LoginView(APIView):
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
                    token = secrets.token_hex(32)  # You can use Django's built-in TokenAuthentication or generate your own

                    # Optionally set an expiration time for the session
                    cache.set(f'user_session_{token}', user.id, timeout=1800)  # 1 hour

                    return Response({'message': 'Login successful', 'token': token}, status=status.HTTP_200_OK)
                else:
                    return Response({'message': 'User is not admin'}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CampListCreateAPIView(APIView):
    authentication_classes = [SessionAuthentication]  # Use custom authentication
    permission_classes = [IsAuthenticated]  # 
    def get(self, request):
        search_query = request.GET.get('search', '')
        
        camps = Camp.objects.all()

        if search_query:
            camps = camps.filter(
                Q(name__icontains=search_query)
            )
        serializer = CampSerializer(camps, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        data =request.data
        place_id = data.get('place')
        name = data.get('name')
        description = data.get('description')
        capacity = data.get('capacity')
        image = data.get('image')
        print(image)
        room_count = int(data.get('roomcount'))

        camp = Camp.objects.create(
            place_id=place_id,
            name=name,
            description=description,
            capacity=capacity,
            image=image,
        )

        for i in range(1, room_count + 1):
            room_name = data.get(f'room_{i}_name')
            room_capacity = data.get(f'room_{i}_capacity')
            room_price = data.get(f'room_{i}_price')
            room_image = data.get(f'room_{i}_image')

            Room.objects.create(
                camp=camp,
                name=room_name,
                capacity=room_capacity,
                price_per_night=room_price,
                image=room_image,
            )
        return JsonResponse({'status': 'success', 'message': 'Camp and rooms added successfully!'})
    

class CampDetailAPIView(APIView):
    authentication_classes = [SessionAuthentication]  # Use custom authentication
    permission_classes = [IsAuthenticated]  # 
    def get(self, request, pk):
        try:
            # Attempt to get the camp by primary key (pk)
            camp = Camp.objects.get(pk=pk)
        except Camp.DoesNotExist:
            # Return a 404 response if the camp is not found
            raise NotFound(detail="Camp not found.")

        # Serialize the camp object, including its rooms
        serializer = CampDetailSerializer(camp,context={'request': request})
        # Return the serialized data in the response
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        camp = Camp.objects.get(pk=pk)
        serializer = CampSerializer(camp, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        camp = Camp.objects.get(pk=pk)
        rooms = Room.objects.filter(camp=camp)
        rooms.delete()
        camp.delete()
        return Response(status=status.HTTP_200_OK)

class PlaceListView(APIView):
    authentication_classes = [SessionAuthentication]  # Use custom authentication
    permission_classes = [IsAuthenticated]  # 
    def get(self, request):
        search_query = request.GET.get('search', '')
        places = Place.objects.all()
        if search_query:
            places = places.filter(
                Q(title__icontains=search_query)
            )
        serializer = PlaceSerializer(places, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):

            serializer = PlaceSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                print("Serializer Errors:", serializer.errors)

                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CampByPlacesAPIView(APIView):
    authentication_classes = [SessionAuthentication]  # Use custom authentication
    permission_classes = [IsAuthenticated]  # 
    def get(self, request, pk):
        try:
            # Attempt to get the camp by primary key (pk)
            camp = Camp.objects.filter(place=pk)
        except Camp.DoesNotExist:
            # Return a 404 response if the camp is not found
            raise NotFound(detail="Camp not found.")

        # Serialize the camp object, including its rooms
        serializer = CampDetailSerializer(camp,many=True, context={'request': request})

        return Response(serializer.data, status=status.HTTP_200_OK)

class PlaceDetailView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request,pk=None):
        places = Place.objects.filter(id=pk)
        serializer = PlaceSerializer(places, many=True, context={'request': request})
        return Response(serializer.data)
    def delete(self, request,pk=None):
        place = Place.objects.get(pk=pk)
        if place.image:
            if os.path.isfile(place.image.path):
                os.remove(place.image.path)
        place.delete()
        return Response(status=status.HTTP_200_OK)

class RoomDetail(APIView):
    authentication_classes = [SessionAuthentication]  # Use custom authentication
    def get(self, request, pk):
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            raise NotFound(detail="Room not found.")

        serializer = RoomSerializer(room,context={'request': request})
        # Return the serialized data in the response
        return Response(serializer.data, status=status.HTTP_200_OK)