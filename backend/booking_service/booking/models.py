from django.db import models
from django.utils import timezone

class Booking(models.Model):
    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    CANCELED = 'CANCELED'
    BOOKING_STATUS = (
        (PENDING ,1),
        (APPROVED,2),
        (CANCELED,3),
    )

    user_id = models.IntegerField()
    trip_id = models.IntegerField()
    booking_date = models.DateTimeField(default=timezone.now)
    checkin_date = models.DateField()
    checkout_date = models.DateField()
    people_count = models.IntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=BOOKING_STATUS, default='1')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-booking_date']
        db_table = 'bookings'

    def __str__(self):
        return f"Booking {self.booking_id} - User {self.user_id}"

    def cancel_booking(self):
        self.status = 'CANCELLED'
        self.save()

    def confirm_booking(self):
        self.status = 'CONFIRMED'
        self.save()

    def complete_booking(self):
        self.status = 'COMPLETED'
        self.save()

class BookingCamp(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='booking_camps')
    camp_id = models.IntegerField()
    people_count = models.IntegerField(default=1)  # Optional if needed per camp
    checkin_date = models.DateField()
    checkout_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class BookingRoom(models.Model):
    booking_camp = models.ForeignKey(BookingCamp, on_delete=models.CASCADE, related_name='booking_rooms')
    room_id = models.IntegerField()
    count = models.IntegerField(default=1)  # Optional if needed per room
