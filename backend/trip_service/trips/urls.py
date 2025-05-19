from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('place/<int:pk>/', views.PlacesByDistance.as_view()),
    path('trip/create/', views.TripCreateAPIView.as_view()),
    path('trip/', views.TripAPIView.as_view()),
    path('detail/<int:pk>/', views.TripDetailAPIView.as_view()),
    path('pdf/', views.PDFAPIView.as_view()),
    path("chat/", views.ChatbotAPIView.as_view(), name="chatbot"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL)
