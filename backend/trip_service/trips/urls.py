from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Camp views
    path('place/<int:pk>/', views.PlacesByDistance.as_view()),
    path('trip/create/', views.TripCreateAPIView.as_view()),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
