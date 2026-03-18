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
        headers={
            "ngrok-skip-browser-warning": "true",
            "User-Agent": "JackShelbyBot/1.0",
        },
        timeout=120
    )

    if response.status_code != 200:
        print(f"Ollama Error: {response.status_code} - {response.text}")
        return f"AI is temporarily unavailable (Error {response.status_code}). Please try again."

    return response.json()["response"]