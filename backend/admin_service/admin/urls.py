from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Camp views
    path('camps/', views.CampListCreateAPIView.as_view(), name='camp_list_create'),
    path('camps/<int:pk>/', views.CampDetailAPIView.as_view(), name='camp_detail'),
    path('place/', views.PlaceListView.as_view(), name='place_detail'),
    path('login/', views.LoginView.as_view(), name='login'),

    # Room views
    # path('api/camp/<int:camp_id>/rooms/', views.RoomListCreateAPIView.as_view(), name='room_list_create'),
    # path('api/room/<int:pk>/', views.RoomDetailAPIView.as_view(), name='room_detail'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
