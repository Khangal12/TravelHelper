from rest_framework import serializers
from .models import Day
from .utils import get_place_details, get_camp_details  # Import utils functions

class DaySerializer(serializers.ModelSerializer):
    place = serializers.SerializerMethodField()
    camp = serializers.SerializerMethodField()

    class Meta:
        model = Day
        fields = ['id', 'trip', 'day_number', 'date', 'title', 'description', 'place', 'camp']

    def get_place(self, obj):
        return get_place_details(obj.place_id)  

    def get_camp(self, obj):
        return get_camp_details(obj.camp_id) if obj.camp_id else None
