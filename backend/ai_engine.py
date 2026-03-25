import requests

OLLAMA_URL = "https://premusically-farmable-carley.ngrok-free.dev/api/generate"

SYSTEM_PROMPT = """You are JackShelby AI, an enterprise logistics support assistant.

COMPANY POLICIES:
- Orders can be cancelled if status is "Pending" or "In Transit"
- Orders "Out for Delivery" or "Delivered" cannot be cancelled
- Returns are accepted within 7 days of delivery
- Refunds are processed within 5-7 business days after approval
- Delayed orders get automatic ₹200 compensation after 3 days past ETA
- Cancellation has a ₹50 processing fee deducted from refund

BEHAVIOR:
- Always analyze order data before responding
- Provide specific suggestions based on order status
- Mention eligibility for cancellation/return/refund
- Give reasoning for your answers
- Be professional but friendly
- Keep responses concise and actionable
- Use order IDs when referring to specific orders"""


def jackshelby_ai(prompt):
    full_prompt = f"{SYSTEM_PROMPT}\n\n{prompt}"

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": "mistral",
                "prompt": full_prompt,
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

    except requests.exceptions.Timeout:
        return "AI response timed out. Please try again with a shorter query."
    except requests.exceptions.ConnectionError:
        return "Cannot connect to AI engine. Please ensure Ollama is running."
    except Exception as e:
        print(f"AI Engine Error: {e}")
        return "An unexpected error occurred. Please try again."


def ai_analyze_insights(orders_data):
    """Generate AI insights from order analytics data"""
    prompt = f"""{SYSTEM_PROMPT}

Analyze the following logistics data and provide 3-5 key insights.
Focus on: delays, returns, refund patterns, city performance.
Keep each insight to one sentence. Format as bullet points.

Data:
{orders_data}

Insights:"""

    try:
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
            timeout=60
        )

        if response.status_code == 200:
            return response.json()["response"]
        return "Unable to generate insights at this time."

    except Exception:
        return "AI insights temporarily unavailable."