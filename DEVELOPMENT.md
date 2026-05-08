# Development Setup

This project is free to use and each user runs their own local backend instance. The backend is built with FastAPI and SQLite, while the frontend uses React + TypeScript with Vite.

---

## Prerequisites

Before starting, make sure you have the following installed:

| Tool       | Version             | Download                          |
| ---------- | ------------------- | --------------------------------- |
| Python     | 3.10+               | https://python.org/downloads      |
| Node.js    | 18+ LTS             | https://nodejs.org                |
| PowerShell | Built-in on Windows | Search "PowerShell" in Start menu |

> ⚠️ **All `.bat` scripts must be run in PowerShell or Command Prompt — not Git Bash.**

Verify your installs by opening PowerShell and running:

```powershell
python --version
node --version
npm --version
```

If any return "command not found", install that tool before continuing.

---

## Backend

1. Open PowerShell or Command Prompt.
2. `cd backend`
3. `python -m venv .venv`
4. `.\.venv\Scripts\activate`
   - On macOS/Linux use `source .venv/bin/activate` instead.
5. `python -m pip install -r requirements.txt`

### Start backend

Run from the project root:

```bat
start-backend.bat
```

Or double-click `start-backend.bat` in Windows Explorer.

- The API will be available at `http://localhost:8000`
- The frontend expects `VITE_API_BASE_URL=http://localhost:8000/api`

### Local-only backend

- Each clone should use its own local backend.
- Do not commit `frontend/.env.local` or any local SQLite files.
- Generated database files (`*.db`, `*.db-shm`, `*.db-wal`) are already excluded by `.gitignore`.

---

## Frontend

1. Open a second PowerShell or Command Prompt window.
2. `cd frontend`
3. `npm install`
4. Copy `frontend/.env.example` to `frontend/.env.local`
5. Set the API URL in `.env.local`:

```text
VITE_API_BASE_URL=http://localhost:8000/api
```

6. Run from the project root:

```bat
start-frontend.bat
```

The frontend runs at `http://localhost:5173`.

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

| Problem                                         | Solution                                                                                                                                                              |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Set-Location: command not found`               | You are in Git Bash. Open PowerShell or Command Prompt instead.                                                                                                       |
| `npm: command not found`                        | Install Node.js from https://nodejs.org                                                                                                                               |
| `python: command not found`                     | Install Python from https://python.org/downloads                                                                                                                      |
| `.venv\Scripts\activate` gives a security error | Run `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force` in the same PowerShell window, then try again. Or use `setup.bat` which avoids this entirely. |
| Frontend shows blank page or API errors         | Confirm `frontend/.env.local` exists and contains `VITE_API_BASE_URL=http://localhost:8000/api`                                                                       |
| Backend won't start                             | Confirm the virtual environment is activated: `.\.venv\Scripts\activate`                                                                                              |
