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
from django.conf import settings
from .utils import getData
from math import radians, sin, cos, sqrt, atan2

from .models import Trip, Day
from datetime import datetime, timedelta

class PlacesByDistance(APIView):
    authentication_classes = [SessionAuthentication]  # Use custom authentication

    def haversine(self, lat1, lon1, lat2, lon2):
        """Calculate the Haversine distance between two points."""
        R = 6371  # Earth radius in km
        lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        a = sin(dlat/2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return R * c  # Distance in km
    
    def get(self, request, pk=None):
        place_data = getData(settings.ADMIN_SERVICE_URL,request=request)
        if pk != 0:
            # If `pk` is provided, find the selected place
            latest_place = next((p for p in place_data if p["id"] == int(pk)), None)
            if not latest_place:
                return JsonResponse({"error": "Place not found"}, status=404)

            lat1, lon1 = latest_place["latitude"], latest_place["longitude"]
        else:
            # First day of the trip – use default starting location
            lat1, lon1 = 47.897902, 106.940918 # Example: Ulaanbaatar city center

        # Calculate distances from the starting point
        places_with_distance = [
            {
                "id": p["id"],
                "title": p["title"],
                "description": p["description"],
                "image_url": p["image_url"],
                "latitude":p["latitude"],
                "longitude":p["longitude"],
                "distance_km": round(self.haversine(lat1, lon1, p["latitude"], p["longitude"]), 1)
            }
            for p in place_data
        ]

        # Sort places by distance
        places_with_distance.sort(key=lambda x: x["distance_km"])

        return Response(
            {"places": places_with_distance[:10]}
        )

class TripCreateAPIView(APIView):
    def post(self, request):
        user = request.user
        data = request.data

        title = data.get("title")
        description = data.get("description")
        start_date_str = data.get("startDate")
        end_date_str = data.get("endDate")
        days = data.get("days")
        itinerary = data.get("itinerary")

        if not all([title, description, start_date_str, end_date_str, days, itinerary]):
            return JsonResponse({"error": "Missing required fields"}, status=400)

        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        except ValueError:
            return JsonResponse({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)

        trip = Trip(
            name=title,
            start_date=start_date,
            end_date=end_date,
            description=description,
            static=user.is_superuser,  # Default value
        )
        trip.save()

        # Create Day instances for each day in the itinerary
        for day_data in itinerary:
            day_number = day_data.get("day")
            place_id = day_data.get("place")
            camp_id = day_data.get("camp")
            additional = day_data.get("additional", "")

            # Calculate the date for this day
            day_date = start_date + timedelta(days=day_number - 1)

            # Create the Day instance
            day = Day(
                trip=trip,
                place_id=place_id,
                camp_id=camp_id,
                day_number=day_number,
                date=day_date,
                title=f"Өдөр {day_number}",  # You can customize this
                description=additional,  # Use the additional field as the description
            )
            day.save()

        return JsonResponse({"message": "Trip created successfully", "trip_id": trip.id}, status=201)