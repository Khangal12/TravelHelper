from rest_framework import serializers
from .models import Day, Trip
from .utils import getData, getDataV2
from django.conf import settings
import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Radius of earth in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    return distance


class TripSerializer(serializers.ModelSerializer):
    days = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = Trip
        fields = '__all__'

    def get_days(self,obj):
        total_day = Day.objects.filter(trip=obj).count()
        return total_day
    
    def get_user(self,obj):
        user_id = obj.created_user_id
        print(user_id)

        if user_id:
        # Construct the URL to fetch user data, using only the user ID
            user_url = f"{settings.USER_SERVICE_URL}{user_id}/"
            
            # Make the API call to fetch user data
            user_data = getData(user_url, request=self.context['request'])
            print(user_data)
            # Return the user data if found
            if user_data:
                user_data.pop('password', None)
                user_data.pop('user_permission', None)
                return user_data
    
        return None
    
    def get_image_url(self, obj):
        # Ensure to return the full URL of the image
        request = self.context.get('request')
        if obj.image:
            # Returns the full URL by concatenating the host with the image path
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


class DaySerializer(serializers.ModelSerializer):
    place = serializers.SerializerMethodField()
    camp = serializers.SerializerMethodField()
    distance_from_prev = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()

    class Meta:
        model = Day
        fields = ['id', 'trip', 'day_number', 'date', 'title', 'description', 'place', 'camp','distance_from_prev','price']

    def get_place(self, obj):
        url = f"{settings.ADMIN_SERVICE_URL}place/{obj.place_id}/"
        data = getDataV2(url, request=self.context['request'])
        if data:
            return data
        return None

    def get_camp(self, obj):
        url = f"{settings.ADMIN_SERVICE_URL}camps/{obj.camp_id}/"
        data = getDataV2(url, request=self.context['request'])
        if data:
            return data
        return None
    
    def get_distance_from_prev(self, obj):
        previous_day = Day.objects.filter(trip=obj.trip, day_number=obj.day_number-1).first()
        if not previous_day:
            return 0  # first day no distance

        prev_place = self.get_place(previous_day)
        curr_place = self.get_place(obj)

        if prev_place and curr_place:
            distance = haversine(
                float(prev_place[0]['latitude']), float(prev_place[0]['longitude']),
                float(curr_place[0]['latitude']), float(curr_place[0]['longitude'])
            )
            return round(distance, 2)
        return 0

    def get_price(self, obj):
        distance = self.get_distance_from_prev(obj)
        base_price = 100
        return base_price + (distance * 2)  # Example: $10 per km


class TripDetailSerializer(serializers.ModelSerializer):
    days = serializers.SerializerMethodField()
    detail = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = '__all__'

    def get_days(self,obj):
        total_day = Day.objects.filter(trip=obj).count()
        return total_day
    
    def get_user(self,obj):
        user_id = obj.created_user_id

        if user_id:
            user_url = f"{settings.USER_SERVICE_URL}{user_id}/"
            
            user_data = getData(user_url, request=self.context['request'])
            if user_data:
                user_data.pop('password', None)
                user_data.pop('user_permission', None)
                return user_data

        return None

    def get_detail(self,obj):
        days = Day.objects.filter(trip=obj)
        data = DaySerializer(days, many=True,context=self.context).data
        return data
    
    def get_image_url(self, obj):
        # Ensure to return the full URL of the image
        request = self.context.get('request')
        if obj.image:
            # Returns the full URL by concatenating the host with the image path
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

    def get_status(self, obj):
        # Ensure to return the full URL of the image
        request = self.context.get('request')
        place_url = f"{settings.BOOKING_SERVICE_URL}check/{obj.id}/"
        place_data = getDataV2(place_url,request=request)
        if place_data.get('exists'):
            return place_data.get('status')
        return None


