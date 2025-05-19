from django.urls import path
from . import views

urlpatterns = [
    path('detail/<int:pk>/', views.UserListView.as_view(), name='user-list'),
    path('list/', views.UserAllListView.as_view(), name='user-list'),
    # path('profiles/', views.ProfileListView.as_view(), name='profile-list'),
    path('auth/permission/', views.PermissionAPIView.as_view(), name='profile-list'),
    path('auth/update/<int:pk>/', views.PermissionUpdateAPIView.as_view(), name='profile-list'),
    path('login-admin/', views.LoginAdminAPIView.as_view(), name='profile-list'),
    path('login/', views.LoginAPIView.as_view()),
    path('sign-up/', views.SignUpAPIView.as_view()),
    path('validate-token/',views.ValidateTokenAPIView.as_view()),
    path("forgot-password/", views.ForgotPasswordAPIView.as_view(), name="forgot-password"),
    path("reset-password/<int:user_id>/<str:token>/", views.ResetPassAPIView.as_view(), name="reset-password"),
]
