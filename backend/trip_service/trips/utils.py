import requests

PLACE_SERVICE_URL = "http://localhost:8001/api/places/"
CAMP_SERVICE_URL = "http://localhost:8001/api/camps/"

def get_place_details(place_id):
    """Fetch place details from the Place microservice"""
    try:
        response = requests.get(f"{PLACE_SERVICE_URL}{place_id}/", timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException:
        return {"id": place_id, "name": "Unknown Place"}  # Fallback response

def get_camp_details(camp_id):
    """Fetch camp details from the Camp microservice"""
    try:
        response = requests.get(f"{CAMP_SERVICE_URL}{camp_id}/", timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException:
        return {"id": camp_id, "name": "Unknown Camp"}  # Fallback response
