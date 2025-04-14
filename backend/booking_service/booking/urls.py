from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Camp views
    path('all/', views.BookingListCreateView.as_view()),
    path('', views.BookingCreateView.as_view()),
    path('check/<int:pk>/', views.CheckBookingView.as_view()),
    path('cancel/<int:pk>/', views.CancelBookingView.as_view()),
    path('approve/<int:pk>/', views.ApproveBookingView.as_view()),
    path('count/<int:pk>/', views.BookingPeopleCountView.as_view()),
    path('detail/<int:pk>/', views.BookingDetailAPIView.as_view()),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL)
