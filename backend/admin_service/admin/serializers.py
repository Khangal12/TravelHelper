from rest_framework import serializers
from .models import Camp, Room, Place

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

class CampSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Camp
        fields = ['id', 'place', 'name', 'description', 'capacity', 'image', 'image_url']

    def get_image_url(self, obj):
        # Ensure to return the full URL of the image
        request = self.context.get('request')
        if obj.image:
            # Returns the full URL by concatenating the host with the image path
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None
    


class RoomSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = ['id', 'camp', 'name', 'capacity', 'image', 'price_per_night','image_url']

    def get_image_url(self, obj):
            # Ensure to return the full URL of the image
            request = self.context.get('request')
            if obj.image:
                return request.build_absolute_uri(obj.image.url) if request else obj.image.url
            return None

class CampDetailSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    place = serializers.SerializerMethodField()
    rooms = RoomSerializer(many=True)
    class Meta:
        model = Camp
        fields = ['id', 'place', 'name', 'description', 'capacity', 'image', 'image_url','rooms','place']

    def get_image_url(self, obj):
        # Ensure to return the full URL of the image
        request = self.context.get('request')
        if obj.image:
            # Returns the full URL by concatenating the host with the image path
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None
    def get_place(self,obj):
        return obj.place.title if obj.place else None

class PlaceSerializer(serializers.ModelSerializer):
    # This ensures that the image field will return a full URL to the image
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Place
        fields = '__all__'

    def get_image_url(self, obj):
        # Ensure to return the full URL of the image
        request = self.context.get('request')
        if obj.image:
            # Returns the full URL by concatenating the host with the image path
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None