from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Camp views
    path('camps/', views.CampListCreateAPIView.as_view(), name='camp_list_create'),
    path('camps/<int:pk>/', views.CampDetailAPIView.as_view(), name='camp_detail'),
    path('camps/byplace/<int:pk>/', views.CampByPlacesAPIView.as_view(), name='camp_detail'),
    path('place/all/', views.PlaceListView.as_view(), name='place_detail'),
    path('place/<int:pk>/', views.PlaceDetailView.as_view(), name='place_detail'),
    path('login/', views.LoginView.as_view(), name='login'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL)
