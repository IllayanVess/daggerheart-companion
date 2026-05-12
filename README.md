> This product includes materials from the Daggerheart System Reference Document 1.0,
> © Critical Role, LLC., used under the Darrington Press Community Gaming License.
> [daggerheart-companion] is not affiliated with Darrington Press or Critical Role.

# Daggerheart Companion

## Disclaimer

This project is an independent, unofficial companion tool and is not affiliated with,
endorsed by, or connected to Darrington Press or Critical Role in any way.

Daggerheart is a trademark of Darrington Press, LLC. All rights to the Daggerheart
game, its rules, and associated content belong to their respective owners.

This tool was built for personal use by fans of the game. No copyright infringement
is intended.

---

A full-stack companion app for running Daggerheart sessions.

- Backend: FastAPI + SQLite
- Frontend: React + TypeScript + Vite

This project is free to use. Each clone runs its own local backend instance.
There is no shared hosted backend included in the repository.

For full developer setup, see `DEVELOPMENT.md`.

---

## Prerequisites

Before running anything, make sure you have these installed:

| Tool    | Version | Download                     |
| ------- | ------- | ---------------------------- |
| Python  | 3.10+   | https://python.org/downloads |
| Node.js | 18+ LTS | https://nodejs.org           |

### Verify your installs

**Windows — open PowerShell and run:**

```powershell
python --version
node --version
npm --version
```

**Mac/Linux — open Terminal and run:**

```bash
python3 --version
node --version
npm --version
```

If any of these return "command not found", install that tool before continuing.

---

## Quick setup

**Windows — run in PowerShell or Command Prompt:**

```bat
.\setup.bat
```

**Mac/Linux — run in Terminal:**

```bash
chmod +x setup.sh start-backend.sh start-frontend.sh
./setup.sh
```

This will check your prerequisites, set up the Python virtual environment, install
backend dependencies, install frontend packages, and create your `.env.local` file
automatically.

If you prefer to set up manually, follow the steps below.

---

## Current app features

| Route                        | Screen                                | Key Components                                           |
| ---------------------------- | ------------------------------------- | -------------------------------------------------------- |
| `#/`                         | Home                                  | `Layout/`, `Navigation/`, `PageHero/`, `ActionCardGrid/` |
| `#/characters`               | Character roster + sheet              | `Characters/` (roster), `CharacterSheet/` (detail view)  |
| `#/builder`                  | Character builder (9-step flow)       | `CharacterForm/`                                         |
| `#/gm-tools`                 | GM tools hub                          | `GM/GmToolsHub.tsx`                                      |
| `#/gm-tools/adversaries`     | Adversary library + builder           | `AdversaryForm/`                                         |
| `#/gm-tools/npcs`            | NPC library + builder                 | `NpcForm/`                                               |
| `#/gm-tools/environments`    | Environment library + builder         | `EnvironmentForm/`                                       |
| `#/gm-tools/encounter-board` | 30x30 tactical encounter grid         | `EncounterBoard/` (900 cells, drag-drop tokens)          |
| `#/gm-tools/dice`            | Dice roller (supports 2d12 Hope/Fear) | `DiceRoller/`                                            |
| `#/gm-tools/session-tracker` | Session tracker (Fear, HP, Stress)    | `GM/SessionTrackerBoard/`                                |

---

## Setup

### Backend

**Windows:**

1. Open PowerShell or Command Prompt.
2. `cd backend`
3. `python -m venv .venv`
4. `.\.venv\Scripts\activate`
5. `python -m pip install -r requirements.txt`

**Mac/Linux:**

1. Open Terminal.
2. `cd backend`
3. `python3 -m venv .venv`
4. `source .venv/bin/activate`
5. `pip install -r requirements.txt`

The backend automatically creates `backend/database/daggerheart.db` on first startup.
You do not need to create any database files or folders manually.

> The repository ignores generated SQLite files only (`*.db`, `*.db-shm`, `*.db-wal`).
> The `backend/database/` folder itself is kept in source control for SQL and schema files.

### Frontend

**Windows:**

1. Open a second PowerShell or Command Prompt window.
2. `cd frontend`
3. `npm install`
4. Copy `frontend\.env.example` to `frontend\.env.local`

**Mac/Linux:**

1. Open a second Terminal window.
2. `cd frontend`
3. `npm install`
4. `cp frontend/.env.example frontend/.env.local`

Set the local API URL in `frontend/.env.local`:

```text
VITE_API_BASE_URL=http://localhost:8000/api
```

### Start the app

Open two separate terminals from the project root:

**Terminal 1 — backend:**

Windows:

```bat
.\start-backend.bat
```

Mac/Linux:

```bash
./start-backend.sh
```

**Terminal 2 — frontend:**

Windows:

```bat
.\start-frontend.bat
```

Mac/Linux:

```bash
./start-frontend.sh
```

Both need to stay open while you use the app.

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
- Each user gets their own local SQLite database at `backend/database/daggerheart.db`.

---

## API reference

The backend exposes these endpoint groups (all under `/api`):

**Health & Root**

- `GET /` — root welcome message
- `GET /health` — health check

**Lookup / Reference Data**

- `GET /lookup/classes`
- `GET /lookup/class/{class_name}`
- `GET /lookup/subclass/{subclass_name}`
- `GET /lookup/ancestries`
- `GET /lookup/communities`
- `GET /lookup/domain-cards`
- `GET /lookup/equipment`
- `GET /lookup/items`
- `GET /lookup/consumables`
- `GET /lookup/inventory-content`

**Characters**

- `GET /characters`
- `GET /characters/summary`
- `GET /characters/{character_id}`
- `POST /characters`
- `PUT /characters/{character_id}`
- `PATCH /characters/{character_id}/trackers`
- `PATCH /characters/{character_id}/sheet-details`
- `GET /characters/{character_id}/inventory`
- `POST /characters/{character_id}/inventory`
- `PATCH /characters/{character_id}/inventory/{entry_id}`
- `DELETE /characters/{character_id}/inventory/{entry_id}`

**Adversaries**

- `GET /adversaries`
- `GET /adversaries/{adversary_id}`
- `POST /adversaries`
- `PUT /adversaries/{adversary_id}`
- `DELETE /adversaries/{adversary_id}`

**NPCs**

- `GET /npcs`
- `GET /npcs/{npc_id}`
- `POST /npcs`
- `PUT /npcs/{npc_id}`
- `DELETE /npcs/{npc_id}`

**Environments**

- `GET /environments`
- `GET /environments/{environment_id}`
- `POST /environments`
- `PUT /environments/{environment_id}`
- `DELETE /environments/{environment_id}`

**Encounter Board**

- `GET /encounter-board/`
- `PUT /encounter-board/`

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
| `permission denied: ./setup.sh` on Mac/Linux    | Run `chmod +x setup.sh start-backend.sh start-frontend.sh` once, then try again.                                                                     |
| Frontend shows blank page or API errors         | Confirm `frontend/.env.local` exists and contains `VITE_API_BASE_URL=http://localhost:8000/api`                                                      |
| Backend won't start                             | Confirm the virtual environment is activated before starting.                                                                                        |
| Characters not showing                          | Make sure both the backend and frontend terminals are running at the same time.                                                                      |

---

## Notes

- No tests are included currently.
- This repository is intended for local use, with each user running their own backend and frontend.
- `backend/database/` is not ignored wholesale — only generated SQLite files are excluded.
- `.env.local` is excluded by `.gitignore` and must be created locally from `.env.example`.

For contribution guidelines, see `CONTRIBUTING.md`.

---

## Legal & License

- Darrington Press Community Gaming License: https://darringtonpress.com/license/
- Daggerheart SRD source: https://daggerheartsrd.com/
