from django.db import models

class Trip(models.Model):
    name = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.TextField()
    static = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Day(models.Model):
    trip = models.ForeignKey(Trip, related_name='days', on_delete=models.CASCADE)
    place_id = models.IntegerField()  # Store the ID of Place from another service
    camp_id = models.IntegerField(blank=True, null=True)  # Store the ID of Camp from another service
    day_number = models.IntegerField()
    date = models.DateField()
    title = models.CharField(max_length=200)
    description = models.TextField()

    def __str__(self):
        return f"Day {self.day_number} of {self.trip.name}"


class Activity(models.Model):
    day = models.ForeignKey(Day, related_name='activities', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return self.title
