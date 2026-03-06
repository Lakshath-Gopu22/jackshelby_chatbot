import requests

OLLAMA_URL = "https://premusically-farmable-carley.ngrok-free.dev/api/generate"

def jackshelby_ai(prompt):
    try:
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

    except Exception as e:
        print("AI error:", e)
        return "⚠️ JackShelby AI is currently unavailable. Please try again."