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
                user_data= cache.get(f'user_session_{token}')

                if user_data:
                    user = type("User", (object,), user_data)
                    request.user = user
                    return (user, token)
                else:
                    raise AuthenticationFailed('Invalid or expired token')

                # Retrieve the user from the database
       

            except IndexError:
                raise AuthenticationFailed('Token is malformed')
            except User.DoesNotExist:
                raise AuthenticationFailed('User not found')
            except Exception as e:
                raise AuthenticationFailed(f'Authentication failed: {str(e)}')

        # Return None if no token is provided or it's invalid
        return None
