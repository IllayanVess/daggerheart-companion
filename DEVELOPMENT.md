# Development Setup

This project is free to use and each user runs their own local backend instance. The backend is built with FastAPI and SQLite, while the frontend uses React + TypeScript with Vite.

---

## Prerequisites

Before starting, make sure you have the following installed:

| Tool    | Version | Download                     |
| ------- | ------- | ---------------------------- |
| Python  | 3.10+   | https://python.org/downloads |
| Node.js | 18+ LTS | https://nodejs.org           |

> ⚠️ **Windows users: run scripts in PowerShell or Command Prompt — not Git Bash.**
> **Mac/Linux users: run scripts in Terminal.**

Verify your installs:

**Windows:**

```powershell
python --version
node --version
npm --version
```

**Mac/Linux:**

```bash
python3 --version
node --version
npm --version
```

If any return "command not found", install that tool before continuing.

---

## Setup script

Run `setup` once after cloning. It handles everything needed to get the project ready.

**Windows:**

```bat
.\setup.bat
```

**Mac/Linux:**

```bash
chmod +x setup.sh
./setup.sh
```

### What `setup` does

1. **Checks prerequisites** — verifies Python and Node.js are available and prints their versions.
2. **Creates the Python virtual environment** — runs `python3 -m venv .venv` inside `backend/` if it does not already exist.
3. **Installs Python dependencies** — runs `pip install -r requirements.txt` inside the activated venv.
4. **Seeds the database** — runs `backend/database/recreate_db.py` to populate initial reference data (classes, ancestries, domain cards, equipment, etc.). This step is skipped safely if the database already contains data, so re-running setup will not wipe your characters or custom content. To force a full database reset, run `launch --recreate-db` (see below).
5. **Creates `frontend/.env.local`** — writes `VITE_API_BASE_URL=http://localhost:8000/api` so the frontend knows where to reach the backend. This file is overwritten each time setup runs to ensure the URL is correct.
6. **Installs npm dependencies** — runs `npm install` inside `frontend/`.

Re-running setup is safe at any time (for example, after pulling new dependencies).

---

## Launch script

Run `launch` each time you want to use the app. It starts both the backend and frontend together.

**Windows:**

```bat
.\launch.bat
```

**Mac/Linux:**

```bash
./launch.sh
```

### What `launch` does

- Activates the Python virtual environment.
- Starts the FastAPI backend (equivalent to `uvicorn` from `backend/app/main.py`).
- Starts the Vite dev server for the frontend.
- Both processes run together; closing the terminal (or pressing Ctrl+C) stops them.

### Resetting the database

To drop and recreate the database from scratch (this deletes all characters and custom content):

**Windows:**

```bat
.\launch.bat --recreate-db
```

**Mac/Linux:**

```bash
./launch.sh --recreate-db
```

---

## Manual startup (without launch script)

If you need to run the backend and frontend separately, use the individual start scripts.

### Backend

Run from the project root:

**Windows:**

```bat
.\start-backend.bat
```

**Mac/Linux:**

```bash
./start-backend.sh
```

- Activates the virtual environment and starts the FastAPI server.
- The API will be available at `http://localhost:8000`.
- The frontend expects `VITE_API_BASE_URL=http://localhost:8000/api`.

### Frontend

Open a second terminal and run from the project root:

**Windows:**

```bat
.\start-frontend.bat
```

**Mac/Linux:**

```bash
./start-frontend.sh
```

- Starts the Vite dev server.
- The frontend will be available at `http://localhost:5173`.

Both terminals need to stay open while you use the app.

---

## Local-only backend

- Each clone should use its own local backend.
- Do not commit `frontend/.env.local` or any local SQLite files.
- Generated database files (`*.db`, `*.db-shm`, `*.db-wal`) are already excluded by `.gitignore`.

---

## Build verification

```powershell
cd frontend
npm run build
```

---

## GitHub Actions CI

This repository includes a CI workflow that installs dependencies and verifies the frontend build. There are no automated tests configured yet.

---

## Troubleshooting

| Problem                                         | Solution                                                                                                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Set-Location: command not found`               | You are in Git Bash. Open PowerShell or Command Prompt instead.                                                                                      |
| `start-backend.bat` not recognized              | Add `.\` before the filename: `.\start-backend.bat`                                                                                                  |
| `npm: command not found`                        | Install Node.js from https://nodejs.org                                                                                                              |
| `python: command not found` on Windows          | Install Python from https://python.org/downloads                                                                                                     |
| `python: command not found` on Mac              | Use `python3` instead of `python`                                                                                                                    |
| `.venv\Scripts\activate` gives a security error | Run `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force` in the same PowerShell window, then try again. Or use `.\setup.bat` instead. |
| `permission denied: ./setup.sh` on Mac/Linux    | Run `chmod +x setup.sh` once, then try again.                                                                                                        |
| Frontend shows blank page or API errors         | Confirm `frontend/.env.local` exists and contains `VITE_API_BASE_URL=http://localhost:8000/api`                                                      |
| Backend won't start                             | Confirm the virtual environment is activated before starting.                                                                                        |
| Characters not showing                          | Make sure both the backend and frontend are running at the same time.                                                                                |
