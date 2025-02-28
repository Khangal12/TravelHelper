# users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.UserListView.as_view(), name='user-list'),
    path('profiles/', views.ProfileListView.as_view(), name='profile-list'),
]
