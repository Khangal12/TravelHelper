from django.db import models
from django.contrib.auth.models import User

class UserDetail(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="detail")
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.phone}"
    
class Place(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6) 
    image = models.ImageField(upload_to='places/')
    
    def __str__(self):
        return self.name

class Camp(models.Model):
    place = models.ForeignKey(Place, related_name='camps', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField()
    capacity = models.IntegerField()
    image = models.ImageField(upload_to='camps/')

    def __str__(self):
        return self.name

class Room(models.Model):
    camp = models.ForeignKey(Camp, related_name='rooms', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)  # e.g., "Ger 1", "Ger 2", etc.
    capacity = models.IntegerField()
    image = models.ImageField(upload_to='rooms/')
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)  # Price per night for this room
    
    def __str__(self):
        return f"{self.name} - Capacity: {self.capacity} - Price: {self.price_per_night}"
