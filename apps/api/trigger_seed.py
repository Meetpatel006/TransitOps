import requests

API_URL = "https://transitops-ss5y.onrender.com/api/seed"
SECRET = "transitops-seed"

print(f"Triggering database seed at {API_URL}...")

try:
    response = requests.post(f"{API_URL}?secret={SECRET}")
    
    if response.status_code == 200:
        print("Success! Database seeded properly.")
        print(response.json())
    else:
        print(f"Failed! Status code: {response.status_code}")
        print("Response:", response.text)
except Exception as e:
    print(f"Error connecting to API: {e}")
