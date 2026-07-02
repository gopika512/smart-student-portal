import requests
try:
    response = requests.post("http://localhost:8000/api/auth/register", json={
        "email": "test@test.com",
        "full_name": "Test User",
        "password": "password",
        "role": "student"
    })
    print("STATUS CODE:", response.status_code)
    print("RESPONSE:", response.text)
    print("HEADERS:", response.headers)
except Exception as e:
    print("ERROR:", str(e))
