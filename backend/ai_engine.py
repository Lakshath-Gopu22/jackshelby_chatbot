import requests

OLLAMA_URL = "https://premusically-farmable-carley.ngrok-free.dev/api/generate"

def jackshelby_ai(prompt):
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": "mistral",
            "prompt": prompt,
            "stream": False
        },
        timeout=60
    )

    return response.json()["response"]