import requests
import json

url = "http://localhost:8000/api/v1/documents/text"
headers = {"Content-Type": "application/json"}
data = {
    "content": "This is a test document about a scam. Someone asked me to transfer 500 dollars to a bank account in Nigeria.",
    "source": "test_curl",
    "source_type": "raw_text"
}

response = requests.post(url, headers=headers, json=data)
print(response.status_code)
print(json.dumps(response.json(), indent=2))
