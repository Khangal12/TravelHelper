from rest_framework.authentication import BaseAuthentication
from django.core.cache import cache
from django.contrib.auth.models import User

class SessionAuthentication(BaseAuthentication):
    def authenticate(self, request):
        token = request.headers.get('Authorization')
        if token:
            token = token.split(' ')[1]  # Assuming the token is passed in 'Authorization: Bearer <token>'
            # Check if the token exists in Redis
            if cache.get(f'user_session_{token}'):
                return (User.objects.get(id=token), None)
        return None  # No user found
