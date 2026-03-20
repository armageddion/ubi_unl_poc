# UBI UNL POC - Backend

Python FastAPI backend for the UBI UNL POC application.

## Project Structure

```
backend/
├── main.py           # FastAPI application with auth + API endpoints
├── requirements.txt  # Python dependencies
├── render.yaml       # Render deployment configuration
├── .env.example      # Environment variables template
└── README.md         # This file
```

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your configuration:
   - `SOLUME_USERNAME`: Your Solume API username
   - `SOLUME_PASSWORD`: Your Solume API password
   - `SOLUME_COMPANY`: Company identifier
   - `SOLUME_STORE`: Store identifier
   - `SOLUME_ENDPOINT_1`: Endpoint for page change (default: `/common/api/v2/labels/page`)
   - `SOLUME_ENDPOINT_2`: Endpoint for LED blink (default: `/common/api/v2/labels/led`)
   - `ALLOWED_ORIGIN`: Your GitHub Pages URL (e.g., `https://username.github.io/repo-name`)

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run locally:
   ```bash
   uvicorn main:app --reload
   ```

## Deployment to Render

1. Create a new Render account (render.com)
2. Go to "Blueprints" → "Create Blueprint Instance"
3. Connect your GitHub repository
4. Render will read `render.yaml` and auto-configure the service
5. Add environment variables from `.env` in the Render dashboard

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/trigger-1` | Execute Page Change |
| PUT | `/api/trigger-2` | Execute LED Blink |

## Trigger 1: Page Change (POST)

**Request:**
```json
{
  "labelCodes": ["04507B0AC391", "04507B0AC392"],
  "page": 1
}
```

**Payload sent to Solume:**
```json
{
  "company": "...",
  "store": "...",
  "pageChangeList": [
    { "labelCode": "04507B0AC391", "page": 1 },
    { "labelCode": "04507B0AC392", "page": 1 }
  ]
}
```

## Trigger 2: LED Blink (PUT)

**Request:**
```json
{
  "labelCodes": ["04507B0AC391", "04507B0AC392"],
  "color": "RED",
  "duration": "0s"
}
```

**Payload sent to Solume:**
```json
{
  "company": "...",
  "store": "...",
  "ledBlinkList": [
    { "labelCode": "04507B0AC391", "color": "RED", "duration": "0s", "patternId": 0, "multiLed": false },
    { "labelCode": "04507B0AC392", "color": "RED", "duration": "0s", "patternId": 0, "multiLed": false }
  ]
}
```

## Response Format

```json
{
  "status": "success|failure",
  "message": "Descriptive message",
  "data": {}
}
```
