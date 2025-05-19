from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from .auth import SessionAuthentication
from django.conf import settings
from .utils import getData, safe_image_loader, strip_think_tags
from math import radians, sin, cos, sqrt, atan2
import json
import re
import os
import requests
import time
from rest_framework.pagination import PageNumberPagination
from .serializers import TripSerializer,TripDetailSerializer,DaySerializer, TripDetailChatBotSerializer
from .models import Trip, Day
from datetime import datetime, timedelta
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.permissions import AllowAny
from together import Together

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
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.fonts import addMapping

class PlacesByDistance(APIView):
    authentication_classes = [SessionAuthentication]

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
            latest_place = next((p for p in place_data if p["id"] == int(pk)), None)
            if not latest_place:
                return JsonResponse({"error": "Place not found"}, status=404)

            lat1, lon1 = latest_place["latitude"], latest_place["longitude"]
        else:
            lat1, lon1 = 47.897902, 106.940918 # Example: Ulaanbaatar city center

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
        user = request.user

        if search_query:
            trips = trips.filter(
                Q(name__icontains=search_query)
            )

        if user and not user.is_superuser:
            trips = trips.filter(Q(created_user_id=user.id) | Q(static=True))
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
            font_path = os.path.join(settings.BASE_DIR, 'media/font/DejaVuSerif.ttf')
            pdfmetrics.registerFont(TTFont('DejaVuSerif', font_path))
            addMapping('DejaVuSerif', 0, 0, 'DejaVuSerif')
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []
            styles = getSampleStyleSheet()
            styles['Normal'].fontName = 'DejaVuSerif'
            styles['Heading2'].fontName = 'DejaVuSerif'

            overview_data = [
                ["Аяллын тайлан", ""],
                ["Эхлэх огноо", data['checkin_date']],
                ["Дуусах огноо", data['checkout_date']],
                ["Хүний тоо", str(data['people_count'])],
                ["Нийт үнэ", f"${float(data['total_price']):,.2f}" if data.get('total_price') else " "],
            ]
            overview_table = Table(overview_data, colWidths=[2 * inch, 4 * inch])
            overview_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('SPAN', (0, 0), (-1, 0)),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'DejaVuSerif'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('FONTNAME', (0, 1), (-1, -1), 'DejaVuSerif'),
                ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('BOX', (0, 0), (-1, -1), 1, colors.black),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            elements.append(overview_table)
            elements.append(Spacer(1, 24))

            for i, day in enumerate(data['booking_camps'], start=1):
                camp = day.get('details', {})
                
                day_title = f"Өдөр {i}: {camp.get('place', 'Unknown Location')} ({day['checkin_date']} - {day['checkout_date']})"
                elements.append(Paragraph(day_title, styles['Heading2']))
                elements.append(Spacer(1, 12))

                if camp.get('image_url'):
                    url = camp.get('image_url')
                    try:
                        print(url)
                        response = requests.get(url)
                        response.raise_for_status()
                        img_data = BytesIO(response.content)
                        img = Image(img_data, width=450, height=300, hAlign='CENTER')
                        elements.append(img)
                        elements.append(Spacer(1, 6))
                    except Exception as e:
                        print("Failed to load image:", e)

                acc_text = [
                    f"<b>Байрлах газар:</b> {camp.get('name', '')}",
                    camp.get('description', '')
                ]
                booking_rooms = day.get('booking_rooms')
                if booking_rooms:
                    acc_text.append("<b>Захиалсан өрөө:</b>")
                    for booking in booking_rooms:
                        room = booking.get('room', {})
                        count = booking.get('count', 1)
                        room_line = f"• {room.get('name', 'N/A')} (Capacity: {room.get('capacity', 'N/A')}) — x{count} өрөө, ${room.get('price_per_night', 'N/A')}/шөнө"
                        acc_text.append(room_line)
                        # print(room)
                        # if room.get('image_url'):
                        #     try:
                        #         image_url = room.get['image_url'].replace('localhost', '127.0.0.1')
                        #         img_data = urlopen(image_url).read()
                        #         img = Image(BytesIO(img_data), width=300, height=200, hAlign='LEFT')
                        #         elements.append(img)
                        #         elements.append(Spacer(1, 4))
                        #     except:
                        #         pass

                # Add full paragraph with camp info
                elements.append(Paragraph("<br/>".join(acc_text), styles['Normal']))
                elements.append(Spacer(1, 24))



            doc.build(elements)
            buffer.seek(0)
            return FileResponse(buffer, as_attachment=True, filename='{}')

        except Exception as e:
            buffer.close()
            return HttpResponse(f"Error generating PDF: {e}", status=500)

class ChatbotAPIView(APIView):
    authentication_classes = [SessionAuthentication]

    def post(self, request):
        user_message = request.data.get("message", "")

        client = Together(api_key=settings.TOGETHER_API_KEY)

        trips = Trip.objects.all()

        trip_serializer = TripDetailChatBotSerializer(trips, many=True, context={'request': request})
        trip_data = json.dumps(trip_serializer.data, ensure_ascii=False)

        response = client.chat.completions.create(
            model="deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
            messages=[{
                        "role": "system",
                        "content": f"Here is all my trip data: {trip_data}. You are a travel assistant. Based on the user's question, provide the relevant trip detail and trip ID in this format 'trip_id: <ID>'. For example, if the user asks for the most expensive trip, you should return the ID like trip_id:129 of that trip and detail with good ui. And give me all response in mongolian always"
                    },
                    {"role": "user", 
                    "content": user_message
                    }],
            stream=True
        )

        full_reply = ""
        trip_id = None

        for token in response:
            if hasattr(token, 'choices'):
                delta = token.choices[0].delta.content
                if delta:
                    print(delta)
                    full_reply += delta

        matches = re.findall(r'trip[\s_]?id\s*[:=]?\s*(\d+)', full_reply, re.IGNORECASE)
        trip_id = matches[-1] if matches else None
        cleaned_reply = strip_think_tags(full_reply)
        if trip_id:
            image_url = Trip.objects.filter(id=trip_id).values_list('image', flat=True).first()

        return Response({
            "reply": cleaned_reply,
            "trip_id": int(trip_id) if trip_id else None,
            "image": 'http://localhost/media/' + str(image_url) if image_url else None,
        })