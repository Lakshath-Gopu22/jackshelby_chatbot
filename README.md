# JackShelby Logistics OS

A premium, full-stack logistics and order management dashboard featuring a mock AI Chatbot (powered by Ollama & Mistral) and a business-ready Cancellation Policy system.

## Project Structure
- **/backend**: FastAPI application with SQLite database (`logistics.db`)
- **/react_frontend**: React.js frontend application styled with Tailwind CSS

## Prerequisites
- **Node.js & npm** (for the React frontend)
- **Python 3.8+** (for the FastAPI backend)
- **[Ollama](https://ollama.com/)** (Required for the local AI Chatbot 'JackShelby Core' to function)

---

## 🚀 Setup Instructions

### 1. Setup the AI Engine (Ollama)
The intelligent ChatWindow relies on the **Mistral** model running locally via Ollama.
1. Download and install [Ollama](https://ollama.com/).
2. Open your terminal and pull the model by running: 
   ```bash
   ollama run mistral
   ```
   *(Keep Ollama running in the background. It naturally operates on `http://localhost:11434`)*

### 2. Setup the Backend (FastAPI)
1. Open a new terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   python -m uvicorn main:app --reload --port 8002
   ```
   *Note: On its first run, the backend will automatically generate the `logistics.db` SQLite database and seed it with 25 realistic mock orders.*

### 3. Setup the Frontend (React)
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd react_frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
The application interface will automatically open in your default browser at `http://localhost:3000` (or `3001`/`3002` if port 3000 is occupied).

---

## 🔑 Demo Accounts
You can log in to the system using the following synthesized credentials:
- **Admin Access:** `admin` / `admin123`
- **Customer Access 1:** `luffy` / `onepiece`
- **Customer Access 2:** `eren` / `aot`

## ✨ Features
- **Admin Dashboard:** View global analytics, securely search/filter the live network registry across dimensions, and monitor customer ledgers.
- **Customer Dashboard:** Responsive tracking of active shipments, complete with animated visual progress bars.
- **Cancellation Policy:** Customers can instantly cancel orders if their status is specifically "Pending" or "In Transit", which will simulate a strict business refund process and playfully update the UI securely.
- **AI Chatbot:** A sticky smart-agent interface that provides dynamic typewriter-styled text responses, maintaining the context of the user's current live shipments.
