import requests
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.core.cache import cache
from django.contrib.auth.models import User

class SessionAuthentication(BaseAuthentication):
    def authenticate(self, request):
        token = request.headers.get('Authorization')
        if token:
            try:
                token = token.split(' ')[1]
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

        return None
