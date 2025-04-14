import requests
from PIL import Image as PILImage
from django.conf import settings
from io import BytesIO
from urllib.parse import urlparse

def getData(service_url,request):
    token = request.headers.get("Authorization")
    headers = {
        'Authorization': f'{token}',
    }
    response = requests.get(service_url, headers=headers)
    return response.json()

def getDataV2(url, request=None):
    try:
        headers = {"Authorization": request.headers.get("Authorization")} if request else {}
        response = requests.get(url, headers=headers)

        # Check if the response is successful
        if response.status_code == 200:
            try:
                return response.json()  # Attempt to parse JSON
            except requests.exceptions.JSONDecodeError:
                print(f"Error decoding JSON from {url}, response: {response.text}")  # Debugging
                return None  # Handle cases where the response is not JSON
        else:
            print(f"Failed request: {url}, Status Code: {response.status_code}, Response: {response.text}")  # Debugging
            return None
    except requests.RequestException as e:
        print(f"Request error for {url}: {e}")  # Debugging
        return None

def safe_image_loader(url):
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        
        img = PILImage.open(BytesIO(response.content))
        if img.mode == 'RGBA':
            img = img.convert('RGB')
            
        img_byte_arr = BytesIO()
        img.save(img_byte_arr, format='JPEG', quality=90)
        img_byte_arr.seek(0)
        
        return img_byte_arr
    except Exception as e:
        print(f"Image processing failed for {url}: {e}")
        return None