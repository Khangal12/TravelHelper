from rest_framework import serializers
from .models import Booking, BookingCamp , BookingRoom
from .utils import getData
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

class BookingSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    trip = serializers.SerializerMethodField()
    booking_date = serializers.SerializerMethodField()
    class Meta:
        model = Booking
        fields = '__all__'

    def get_booking_date(self,obj):
        if obj.booking_date:
            return timezone.localtime(obj.booking_date).strftime("%Y-%m-%d %H:%M")
        return None

    def get_user(self, obj):
        user_id = obj.user_id

        if user_id:
            user_url = f"{settings.USER_SERVICE_URL}{user_id}/"
            
            user_data = getData(user_url, request=self.context['request'])
            if user_data:
                user_data.pop('password', None)
                user_data.pop('user_permission', None)
                return user_data

        return None
    
    def get_trip(self, obj):
        trip = obj.trip_id

        if trip:
            trip_url = f"{settings.TRIP_SERVICE_URL}{trip}/"
            
            user_data = getData(trip_url, request=self.context['request'])
            if user_data:
                return user_data

        return None

class BookingRoomSerializer(serializers.ModelSerializer):
    room = serializers.SerializerMethodField()

    class Meta:
        model = BookingRoom
        fields = ['room_id', 'count', 'room']

    def get_room(self, obj):
        room_id = obj.room_id

        if room_id:
            room_url = f"{settings.ADMIN_SERVICE_URL}room/detail/{room_id}/"
            
            room_data = getData(room_url, request=self.context['request'])
            if room_data:
                return room_data

        return None

class BookingCampSerializer(serializers.ModelSerializer):
    booking_rooms = BookingRoomSerializer(many=True, read_only=True)
    details = serializers.SerializerMethodField()
    day = serializers.SerializerMethodField()
    class Meta:
        model = BookingCamp
        fields = ['camp_id', 'people_count', 'checkin_date', 'checkout_date', 'booking_rooms','details','day']

    def get_details(self, obj):
        room_id = obj.camp_id

        if room_id:
            room_url = f"{settings.ADMIN_SERVICE_URL}camps/{room_id}/"
            
            room_data = getData(room_url, request=self.context['request'])
            if room_data and room_data.get('rooms'):
                del room_data['rooms']  # Removing the 'rooms' key
                return room_data

        return None

    def get_day(self, obj):
        book = obj.booking
        x = book.checkin_date
        y = obj.checkin_date
        day = (y - x).days
        return day


class BookingDetailSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    # trip = serializers.SerializerMethodField()
    booking_date = serializers.SerializerMethodField()
    booking_camps = BookingCampSerializer(many=True, read_only=True)

    class Meta:
        model = Booking
        fields = ['user_id', 'trip_id', 'booking_date', 'checkin_date', 'checkout_date', 'people_count', 
                  'total_price', 'status', 'created_at', 'updated_at', 'booking_camps','user','id']

    def get_booking_date(self,obj):
        if obj.booking_date:
            return timezone.localtime(obj.booking_date).strftime("%Y-%m-%d %H:%M")
        return None

    def get_user(self, obj):
        user_id = obj.user_id

        if user_id:
            user_url = f"{settings.USER_SERVICE_URL}{user_id}/"
            
            user_data = getData(user_url, request=self.context['request'])
            if user_data:
                user_data.pop('password', None)
                user_data.pop('user_permission', None)
                return user_data

        return None
    
    # def get_trip(self, obj):
    #     trip = obj.trip_id

    #     if trip:
    #         trip_url = f"{settings.TRIP_SERVICE_URL}{trip}/"
            
    #         user_data = getData(trip_url, request=self.context['request'])
    #         if user_data:
    #             return user_data

    #     return None