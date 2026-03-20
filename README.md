# UBI UNL POC

Dual deployment project for triggering Solume API endpoints.

## Architecture

```
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│   GitHub Pages      │      │   Render (Python)   │      │   Solume API        │
│   (Frontend)        │─────▶│   (FastAPI)         │─────▶│                     │
│   auto-deployed     │      │   manual deploy     │      │                     │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
```

## Project Structure

```
ubi_unl_poc/
├── backend/                  # FastAPI backend (deploy to Render)
│   ├── main.py             # API endpoints
│   ├── requirements.txt     # Python dependencies
│   ├── render.yaml         # Render deployment config
│   └── .env.example         # Environment variables template
│
├── frontend/                # Static frontend (auto-deployed to GitHub Pages)
│   ├── index.html          # SPA with password protection
│   ├── styles.css          # Styling
│   └── app.js              # Frontend logic
│
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions: deploys frontend on push
│
└── README.md               # This file
```

## Deployments

### Frontend: GitHub Pages

- **Trigger**: Push to `main` when `frontend/` files change
- **Setup**: Repository Settings → Pages → Source: GitHub Actions
- **URL**: `https://{username}.github.io/{repo-name}/`

### Backend: Render

- **Trigger**: Manual Blueprint deploy
- **Setup**: render.com → Blueprints → Connect repo
- **Env vars**: Set in Render dashboard (see `backend/.env.example`)

## Configuration

### Frontend

1. Update `BACKEND_URL` in `frontend/app.js` with your Render URL
2. Set password hash in `frontend/app.js` (see frontend/README.md)

### Backend

1. Copy `backend/.env.example` to `backend/.env`
2. Fill in credentials:
   - `SOLUME_USERNAME`
   - `SOLUME_PASSWORD`
   - `SOLUME_COMPANY`
   - `SOLUME_STORE`
   - `SOLUME_ENDPOINT_1`
   - `SOLUME_ENDPOINT_2`
   - `ALLOWED_ORIGIN` (your GitHub Pages URL)
3. Add env vars in Render dashboard

## Quick Start

```bash
# Backend (local development)
cd backend
cp .env.example .env
# Edit .env with your credentials
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (local development)
cd frontend
# Serve with any static file server
python -m http.server 8080
```

## Documentation

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
