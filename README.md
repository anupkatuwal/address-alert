# Address Alert

A full-stack web app that verifies any US address against the US Census Geocoding API and instantly emails your team when a match is found.

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF)](https://vitejs.dev/)
[![Deploy on Railway](https://img.shields.io/badge/Deploy-Railway-8A2BE2)](https://railway.app/)

---

## What It Does

1. User enters a US street address and one or more recipient email addresses.
2. The backend queries the **US Census Bureau Geocoding API** to validate and geocode the address.
3. If a match is found, the backend sends an email alert via **Resend** containing the matched address and lat/lon coordinates.
4. The frontend shows the result — matched address, coordinates, and email delivery status — in real time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Lucide icons |
| Backend | Python, FastAPI, Mangum (AWS Lambda adapter) |
| Geocoding | US Census Bureau Geocoding API (free, no key needed) |
| Email | Resend API |
| Deployment | Railway (frontend + backend), render.yaml included |

---

## Repository Structure

```
address-alert/
│
├── backend/
│   ├── main.py               # FastAPI app — /health and /search endpoints
│   ├── geocode.py            # US Census geocoding API client
│   ├── email_alert.py        # Resend email sender
│   ├── config.py             # Settings loaded from environment variables
│   ├── requirements.txt      # Python dependencies
│   ├── requirements-lambda.txt  # Lambda-specific dependencies
│   ├── railway.toml          # Railway deployment config
│   ├── Procfile              # Process file for hosting platforms
│   └── .env.example          # Required environment variables
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React component (form, results UI)
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Styles
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── railway.toml          # Railway deployment config
│
├── render.yaml               # Render.com deployment config
└── .gitignore
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A free [Resend](https://resend.com) account and API key

### 1. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # then fill in your values
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Your Resend API key (get one free at resend.com) |
| `FRONTEND_ORIGIN` | Frontend URL for CORS (default: `http://localhost:5173`) |

---

## API Endpoints

### `GET /health`
Returns service status and whether email is configured.

```json
{ "status": "ok", "email_configured": true }
```

### `POST /search`

**Request:**
```json
{
  "address": "1600 Pennsylvania Ave NW, Washington, DC 20500",
  "recipients": ["you@example.com"]
}
```

**Response:**
```json
{
  "found": true,
  "matched_address": "1600 PENNSYLVANIA AVE NW, WASHINGTON, DC, 20502",
  "coordinates": { "x": -77.0366, "y": 38.8971 },
  "email_sent": true,
  "email_error": null
}
```

---

## Deployment

Both services are pre-configured for **Railway**. Each folder has its own `railway.toml`.

1. Push to GitHub.
2. Create two Railway services — one for `backend/`, one for `frontend/`.
3. Set `RESEND_API_KEY` and `FRONTEND_ORIGIN` in the backend service environment.
4. Set `VITE_API_BASE` in the frontend service environment (to the backend Railway URL).

A `render.yaml` is also included for one-click deployment on **Render**.

---

## License

MIT
