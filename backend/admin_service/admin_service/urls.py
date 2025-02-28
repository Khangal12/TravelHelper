from django.urls import path, include

urlpatterns = [
    path('api/admin/', include('admin.urls')),  # Include user API URLs
]
