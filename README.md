# Daggerheart Companion

## Disclaimer

This project is an independent, unofficial companion tool and is not affiliated with,
endorsed by, or connected to Darrington Press or Critical Role in any way.

Daggerheart is a trademark of Darrington Press, LLC. All rights to the Daggerheart
game, its rules, and associated content belong to their respective owners.

This tool was built for personal use by fans of the game. No copyright infringement
is intended.

A full-stack companion app for running Daggerheart sessions.

- Backend: FastAPI + SQLite
- Frontend: React + TypeScript + Vite

This project is free to use. Each clone runs its own local backend instance.
There is no shared hosted backend included in the repository.

For full developer setup, see `DEVELOPMENT.md`.

---

## Current app features

| Route                        | Screen                              |
| ---------------------------- | ----------------------------------- |
| `#/`                         | Home                                |
| `#/characters`               | Character roster + character editor |
| `#/builder`                  | Character builder                   |
| `#/gm-tools`                 | GM tools hub                        |
| `#/gm-tools/adversaries`     | Adversary library and builder       |
| `#/gm-tools/environments`    | Environment library and builder     |
| `#/gm-tools/dice`            | Dice roller                         |
| `#/gm-tools/session-tracker` | Encounter/session tracker           |

---

## Setup

### Backend

1. Open PowerShell.
2. `cd backend`
3. `python -m venv .venv`
4. `.\.venv\Scripts\activate`
   - On macOS/Linux use `source .venv/bin/activate` instead.
5. `python -m pip install -r requirements.txt`

The backend automatically creates `backend/database/` and `backend/database/daggerheart.db` on first startup, so users do not need to create database files or folders manually.

> Note: the repository ignores generated SQLite files only (`backend/database/*.db`, `backend/database/*.db-shm`, `backend/database/*.db-wal`). The `backend/database/` folder itself is kept in source control for SQL assets and schema files.

### Frontend

1. Open PowerShell.
2. `cd frontend`
3. `npm install`
4. Copy `frontend/.env.example` to `frontend/.env.local`
5. Set the local API URL in `frontend/.env.local`:

```text
VITE_API_BASE_URL=http://localhost:8000/api
```

### Start the app

From the project root:

```powershell
backend\start-backend.ps1
```

Then in a separate terminal:

```powershell
frontend\start-frontend.ps1
```

Both scripts set their working directory automatically using `$PSScriptRoot`, so they work when run from the repo root or directly from their own folders.

The frontend runs on `http://localhost:5173` and calls the backend at `http://localhost:8000/api`.

### Production build

```powershell
cd frontend
npm run build
```

---

## Backend behavior

- The FastAPI backend lives in `backend/app/`.
- `backend/app/main.py` mounts API routers under `/api`.
- The database schema is created automatically when the backend starts.
- Each user gets their own local SQLite database file at `backend/database/daggerheart.db`.

---

## API reference

The backend exposes these main API groups (all under `/api`):

- `GET /api/` — root health endpoint
- `GET /api/health` — health check
- `GET /api/lookup/...` — class/subclass reference data
- `GET /api/characters`
- `GET /api/characters/{character_id}`
- `POST /api/characters`
- `PUT /api/characters/{character_id}`
- `PATCH /api/characters/{character_id}/trackers`
- `PATCH /api/characters/{character_id}/sheet-details`
- `GET /api/characters/{character_id}/inventory`
- `POST /api/characters/{character_id}/inventory`
- `PATCH /api/characters/{character_id}/inventory/{entry_id}`
- `DELETE /api/characters/{character_id}/inventory/{entry_id}`
- `GET /api/adversaries`
- `GET /api/adversaries/{adversary_id}`
- `POST /api/adversaries`
- `PUT /api/adversaries/{adversary_id}`
- `DELETE /api/adversaries/{adversary_id}`
- `GET /api/environments`
- `GET /api/environments/{environment_id}`
- `POST /api/environments`
- `PUT /api/environments/{environment_id}`
- `DELETE /api/environments/{environment_id}`
- `GET /api/encounter-board`
- `PUT /api/encounter-board`

---

## Notes

- No tests are included currently.
- This repository is intended for local use, with each user running their own backend and frontend.
- `backend/database/` is not ignored wholesale. Only generated SQLite files and runtime journal files are ignored.
- `.env.local` is the recommended local frontend configuration file, and `.env` / `.env.local` are already excluded by `.gitignore`.

For contribution guidelines, see `CONTRIBUTING.md`.
