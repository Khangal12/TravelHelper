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
                user_id = cache.get(f'user_session_{token}')
                
                if not user_id:
                    raise AuthenticationFailed('Invalid or expired token')

                # Retrieve the user from the database
                user = User.objects.get(id=user_id)

                # If everything is fine, return the user and token
                return (user, None)

            except IndexError:
                raise AuthenticationFailed('Token is malformed')
            except User.DoesNotExist:
                raise AuthenticationFailed('User not found')
            except Exception as e:
                raise AuthenticationFailed(f'Authentication failed: {str(e)}')

        # Return None if no token is provided or it's invalid
        return None
