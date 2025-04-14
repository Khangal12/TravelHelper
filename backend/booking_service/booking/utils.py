import requests

def getData(url, request=None):
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