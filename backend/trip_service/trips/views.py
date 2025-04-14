from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from .auth import SessionAuthentication
from django.conf import settings
from .utils import getData, safe_image_loader
from math import radians, sin, cos, sqrt, atan2
import json
import os
import requests
import time
from rest_framework.pagination import PageNumberPagination
from .serializers import TripSerializer,TripDetailSerializer,DaySerializer
from .models import Trip, Day
from datetime import datetime, timedelta
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.permissions import AllowAny

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO
from django.http import HttpResponse
from datetime import datetime
from django.http import FileResponse
from reportlab.platypus import Image
from reportlab.lib.utils import ImageReader
from urllib.request import urlopen
from PIL import Image as PILImage

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
        place_url = f"{settings.ADMIN_SERVICE_URL}place/all/"
        place_data = getData(place_url,request=request)
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
    authentication_classes = [SessionAuthentication]  # Use custom authenticatio
    def post(self, request):
        user = request.user
        data = request.data

        title = data.get("title")
        description = data.get("description")
        start_date_str = data.get("startDate")
        end_date_str = data.get("endDate")
        days = data.get("days")
        itinerary = data.get("itinerary")
        capacity = data.get("capacity")
        if isinstance(itinerary, str):
            itinerary = json.loads(itinerary)
        image = data.get("image")

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
            static=user.is_superuser,
            created_user_id = user.id,
            total_price =  0,
            image = image,
            capacity=capacity if capacity else 100,
        )
        trip.save()
        days = []
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
            days.append(day)
        serializer = DaySerializer(days,many=True,context={'request': request})
        data = serializer.data 
        total_price = 0
        for d in data:
            price = d.get('price')
            if price:
                total_price += price
        trip.total_price = total_price
        trip.save()

        return JsonResponse({"message": "Trip created successfully", "trip_id": trip.id}, status=201)
    
class TripPagination(PageNumberPagination):
    page_size = 8 # Default page size
    page_size_query_param = 'page_size'
    max_page_size = 100

class TripAPIView(APIView):
    authentication_classes = [SessionAuthentication]  # Use custom authentication
    def get(self,request):
        search_query = request.GET.get('search', '')
        trips = Trip.objects.all().order_by('-created_at')
        if search_query:
            trips = trips.filter(
                Q(name__icontains=search_query)
            )
        paginator = TripPagination()
        paginated_trips = paginator.paginate_queryset(trips, request)
        serializer = TripSerializer(paginated_trips, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

class TripDetailAPIView(APIView):
    authentication_classes = [SessionAuthentication]
    def get(self,request,pk=None):
        trips = Trip.objects.filter(id=pk)
        serializer = TripDetailSerializer(trips, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class PDFAPIView(APIView):
    permission_classes = [AllowAny] 
    
    def post(self, request):
        data = request.data
        buffer = BytesIO()
        
        try:
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []
            
            # Define styles
            styles = getSampleStyleSheet()
            
            # 1. Title Section
            title_data = [[f"{data['name']} Itinerary"]]
            title_table = Table(title_data, colWidths=[6*inch])
            title_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 16),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ]))
            elements.append(title_table)
            elements.append(Spacer(1, 24))
            
            # 2. Trip Overview
            overview_data = [
                ["Trip Overview", ""],
                ["Start Date", data['start_date']],
                ["End Date", data['end_date']],
                ["Total Days", str(data['days'])],
                ["Total Price", f"${float(data['total_price']):,.2f}" if data.get('total_price') else "Not specified"],
            ]
            
            overview_table = Table(overview_data, colWidths=[2*inch, 4*inch])
            overview_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('SPAN', (0, 0), (-1, 0)),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('BOX', (0, 0), (-1, -1), 1, colors.black),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            elements.append(overview_table)
            elements.append(Spacer(1, 24))
            
            # 3. Daily Itinerary
            for day in data['detail']:
                # Day header
                day_text = f"{day['title']} - {day['date']}"
                elements.append(Paragraph(day_text, styles['Heading2']))
                elements.append(Spacer(1, 12))
                
                # Places to visit with images
                places_text = ["<b>Places to Visit:</b><br/>"]
                for place in day['place']:
                    # Add place image if available
                    if place.get('image_url'):
                        img_data = safe_image_loader(place['image_url'])
                        if img_data:
                            elements.append(Image(img_data, width=400, height=250, hAlign='CENTER'))
                            elements.append(Spacer(1, 6))
                        else:
                            elements.append(Paragraph("[Image: " + place['title'] + "]", styles['Italic']))
                       
                    places_text.append(f"• {place['title']}: {place['description']}")
                
                elements.append(Paragraph("<br/>".join(places_text), styles['Normal']))
                elements.append(Spacer(1, 12))
                
                # Accommodation with image
                camp = day['camp']
                accommodation_text = [f"<b>Accommodation:</b> {camp['name']}"]
                
                # Add camp image if available
                if camp.get('image_url'):
                    try:
                        img_data = urlopen(camp['image_url']).read()
                        img = Image(BytesIO(img_data), width=450, height=300, hAlign='CENTER')
                        elements.append(img)
                        elements.append(Spacer(1, 6))
                    except:
                        pass
                
                accommodation_text.append(camp['description'])
                
                # Room options
                if camp.get('rooms'):
                    accommodation_text.append("<b>Room Options:</b>")
                    for room in camp['rooms']:
                        room_text = f"• {room['name']} (Capacity: {room['capacity']}): "
                        room_text += f"${room['price_per_night']}" if room.get('price_per_night') else "Not specified"
                        
                        # Add room image if available
                        if room.get('image_url'):
                            try:
                                img_data = urlopen(room['image_url']).read()
                                img = Image(BytesIO(img_data), width=300, height=200, hAlign='LEFT')
                                elements.append(img)
                                elements.append(Spacer(1, 4))
                            except:
                                pass
                        
                        accommodation_text.append(room_text)
                
                elements.append(Paragraph("<br/>".join(accommodation_text), styles['Normal']))
                elements.append(Spacer(1, 24))
            # Remove the PageBreak() calls
            doc.build(elements)
            buffer.seek(0)
            # filename = f"laalr.pdf"
            # filepath = os.path.join(settings.MEDIA_ROOT, 'itineraries', filename)
            # os.makedirs(os.path.dirname(filepath), exist_ok=True)
            # with open(filepath, 'wb') as f:
            #     f.write(buffer.getvalue())
            
            # Return response - don't close buffer yet!
            response = FileResponse(buffer, as_attachment=True, content_type='application/pdf')
            return response
            
        except Exception as e:
            error_msg = f"Error generating PDF: {str(e)}"
            print(error_msg)
            buffer.close()  # Only close on error
            return HttpResponse(error_msg, status=500)
        
