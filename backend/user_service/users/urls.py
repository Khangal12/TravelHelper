# users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('detail/<int:pk>/', views.UserListView.as_view(), name='user-list'),
    path('profiles/', views.ProfileListView.as_view(), name='profile-list'),
    path('login-admin/', views.LoginAdminAPIView.as_view(), name='profile-list'),
    path('login/', views.LoginAPIView.as_view()),
    path('validate-token/',views.ValidateTokenAPIView.as_view())
]
