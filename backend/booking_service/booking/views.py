from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import Booking , BookingCamp, BookingRoom
from .serializers import BookingSerializer , BookingDetailSerializer
from .auth import SessionAuthentication
from django.db.models import Sum 
from django.db import transaction
from datetime import datetime, timedelta
from rest_framework.pagination import PageNumberPagination
from django.utils.decorators import method_decorator


class BookPagination(PageNumberPagination):
    page_size = 10 # Default page size
    page_size_query_param = 'page_size'
    max_page_size = 100

class BookingListCreateView(generics.ListCreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    authentication_classes = [SessionAuthentication]

    def get_queryset(self):
        queryset = Booking.objects.all()
        status = self.request.query_params.get('status', None)
        range_date = self.request.query_params.get('range_date', None)

        if status and status != 'all':
            queryset = queryset.filter(status=status)

        if range_date:
            try:
                start_date_str, end_date_str = range_date.split(',')
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            except ValueError:
                return queryset
            except Exception as e:
                return queryset
            if start_date > end_date:
                return queryset
            if start_date == end_date:
                return queryset.filter(checkin_date=start_date, checkout_date=end_date)
            if start_date < end_date:
                queryset = queryset.filter(checkin_date__lte=end_date,checkout_date__gte=start_date)
            else:
                return queryset.none()
        
        return queryset

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        paginator = BookPagination()
        admin = request.user.is_superuser

        if admin is not True:
            queryset = queryset.filter(user_id=request.user.id)

        paginated_books = paginator.paginate_queryset(queryset, request)
        serializer = self.get_serializer(paginated_books,many=True, context={'request': request})

        return paginator.get_paginated_response(serializer.data)

class BookingCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    authentication_classes = [SessionAuthentication]

    def create(self, request, *args, **kwargs):
        data = request.data
        print(data)
        try:
            start_date_str = data['start_date']
            end_date_str = data['end_date']
            trip_id = data['id']
            total_price = data['total_price']
            people_count = int(data['people_count'])
            capacity = int(data['capacity'])
            camps = data['booking_camps']
        except KeyError:
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        # Convert start_date and end_date from strings to datetime objects
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()

        booking_data = {
            'user_id': request.user.id,
            'status': Booking.PENDING,
            'checkin_date': start_date,
            'checkout_date': end_date,
            'trip_id': trip_id,
            'total_price': total_price,
            'people_count': people_count,
        }

        if people_count > capacity:
            return Response({'error': 'Хүний багтаамж хэтэрсэн'}, status=status.HTTP_400_BAD_REQUEST)

        total_people = Booking.objects.filter(
            trip_id=trip_id,
            status__in=[Booking.PENDING, Booking.APPROVED]
        ).aggregate(Sum('people_count'))['people_count__sum'] or 0

        if total_people + people_count > capacity:
            return Response({'error': 'Хүний багтаамж хэтэрсэн'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=booking_data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    booking = serializer.save()
                    for camp in camps:
                        capacity = camp['capacity']
                        day = camp['day_number']

                        total_people_in_camp = BookingCamp.objects.filter(
                            camp_id=camp['camp'],
                            checkin_date=start_date,
                        ).aggregate(Sum('people_count'))['people_count__sum'] or 0

                        if total_people_in_camp + people_count > capacity:
                            raise Exception(f"{start_date} өдөр camp дээр багтаамж хэтэрсэн")

                        booking_camp = BookingCamp.objects.create(
                            booking=booking,
                            camp_id=camp['camp'],
                            people_count=people_count,
                            checkin_date=start_date,
                            checkout_date=start_date + timedelta(days=1),
                        )
                        print(start_date)
                        start_date = start_date + timedelta(days=1)

                        for room in camp['rooms']:
                            BookingRoom.objects.create(
                                booking_camp=booking_camp,
                                room_id=room['room_id'],
                                count=room['quantity']
                            )

                return Response(serializer.data, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CheckBookingView(APIView):
    authentication_classes = [SessionAuthentication]
    def get(self, request, pk=None):
        try:
            user_id = request.user.id
            trip_id = pk

            if not user_id or not trip_id:
                return Response(
                    {'error': 'Both user_id and trip_id are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            booking = Booking.objects.filter(
                user_id=user_id,
                trip_id=trip_id
            ).first()

            if booking:
                return Response({
                    'exists': True,
                    'status': booking.status,
                }, status=status.HTTP_200_OK)
            
            return Response({
                'exists': False,
                'status': None,
                'message': 'No booking found'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CancelBookingView(APIView):
    authentication_classes = [SessionAuthentication]
    def delete(self, request, pk=None):
        try:
            user_id = request.user.id
            trip_id = pk

            if not user_id or not trip_id:
                return Response(
                    {'error': 'Both user_id and trip_id are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            booking = Booking.objects.filter(
                user_id=user_id,
                trip_id=trip_id,
                status = Booking.PENDING
            ).first()

            if booking:
                booking.status = Booking.CANCELED
                booking.save()

                return Response({
                    'exists': True,
                    'status': booking.status,
                }, status=status.HTTP_200_OK)
            
            return Response({
                'exists': False,
                'status': None,
                'message': 'No booking found'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BookingPeopleCountView(APIView):
    authentication_classes = [SessionAuthentication]

    def get(self, request, pk=None):
        trip_id = pk
        if not trip_id:
            return Response({'error': 'trip_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        total_people = Booking.objects.filter(trip_id=trip_id, status__in=[Booking.PENDING, Booking.APPROVED]).aggregate(Sum('people_count'))['people_count__sum'] or 0
        return Response({'count': total_people}, status=status.HTTP_200_OK)


class BookingDetailAPIView(APIView):
    serializer_class = BookingDetailSerializer
    authentication_classes = [SessionAuthentication]

    def get(self, request, pk=None):
        queryset = Booking.objects.filter(id=pk).first()
        serializer = self.serializer_class(queryset,context={'request': request})

        return Response(serializer.data,status=status.HTTP_200_OK)

class ApproveBookingView(APIView):
    authentication_classes = [SessionAuthentication]
    def post(self, request, pk=None):
        try:
            user = request.user.is_superuser
            if user:
                trip_id = pk
                booking = Booking.objects.filter(
                    id=trip_id,
                    status = Booking.PENDING
                ).first()

                if booking:
                    booking.status = Booking.APPROVED
                    booking.save()

                    return Response({
                        'exists': True,
                        'status': booking.status,
                    }, status=status.HTTP_200_OK)
                
                return Response({
                    'exists': False,
                    'status': None,
                    'message': 'No booking found or booking is approved'
                }, status=status.HTTP_200_OK)
            else:
                return Response('Admin will only approve', status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )