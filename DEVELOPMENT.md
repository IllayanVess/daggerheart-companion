# Development Setup

This project is free to use and each user runs their own local backend instance. The backend is built with FastAPI and SQLite, while the frontend uses React + TypeScript with Vite.

## Backend

1. Open a terminal.
2. `cd backend`
3. `python -m venv .venv`
4. `.
venv\Scripts\activate`
5. `python -m pip install -r requirements.txt`

### Start backend

- Run `backend\start-backend.ps1`
- The API should be available at `http://localhost:8000`
- The frontend expects `VITE_API_BASE_URL=http://localhost:8000/api`

### Local-only backend

- Each clone should use its own local backend.
- Do not commit `frontend/.env.local` or any local SQLite files.
- If you need a persistent local database, keep it inside `backend/database/` and ignore it from git.

## Frontend

1. Open a terminal.
2. `cd frontend`
3. `npm install`
4. `npm run dev`

### Environment

- Copy `frontend/.env.example` to `frontend/.env.local`
- Set:
  - `VITE_API_BASE_URL=http://localhost:8000/api`

## Build verification

- `cd frontend`
- `npm run build`

## GitHub Actions CI

This repository includes a CI workflow that installs dependencies and verifies the frontend build. There are no automated tests configured yet.
