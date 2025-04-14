import requests
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.core.cache import cache
from django.contrib.auth.models import User

class SessionAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # Retrieve the Authorization header
        token = request.headers.get('Authorization')

        # If the token exists in the Authorization header
        if token:
            try:
                # Extract the token part after 'Bearer ' prefix
                token = token.split(' ')[1]  # Assumes token format 'Bearer <token>'
                # Check if token exists in Redis cache
                user_data = cache.get(f'user_session_{token}')
                if user_data:
                    user = type("User", (object,), user_data)
                    user.is_authenticated = True
                    request.user = user

                    return (request.user,token)
                else:
                    raise AuthenticationFailed('invalid token')

            except IndexError:
                raise AuthenticationFailed('Token is malformed')
            except Exception as e:
                raise AuthenticationFailed(f'Authentication failed: {str(e)}')

        # Return None if no token is provided or it's invalid
        return None
