from django.db import models
from django.contrib.auth.models import User

class Trip(models.Model):
    name = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.TextField()
    static = models.BooleanField(default=False)
    total_price = models.DecimalField(max_digits=15, decimal_places=1, default=0.0)
    image = models.ImageField(upload_to='trip/')
    capacity = models.IntegerField()
    created_user_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.name

class Day(models.Model):
    trip = models.ForeignKey(Trip, related_name='days', on_delete=models.CASCADE)
    place_id = models.IntegerField()  # Store the ID of Place from another service
    camp_id = models.IntegerField(blank=True, null=True)
    day_number = models.IntegerField()
    date = models.DateField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    # price = models.IntegerField()

    def __str__(self):
        return f"Day {self.day_number} of {self.trip.name}"
