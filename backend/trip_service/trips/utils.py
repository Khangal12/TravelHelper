import requests

def getData(service_url,request):
    token = request.headers.get("Authorization")
    headers = {
        'Authorization': f'{token}',
    }
    response = requests.get(service_url, headers=headers)
    return response.json()