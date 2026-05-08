# Platform Expansion: Tauri (Desktop) + Capacitor (Mobile)

This document is an instruction file for Codex. Follow each phase in order. Do not skip ahead — later phases depend on earlier ones being complete and verified.

## Project context

- Frontend: React + Vite + TypeScript, lives in `frontend/`
- Backend: FastAPI + SQLite, lives in `backend/`
- Backend is currently started via `backend/start-backend.ps1`
- Frontend is currently started via `frontend/start-frontend.ps1`
- `API_BASE_URL` must be read from `VITE_API_BASE_URL` env var (not hardcoded) before any platform work begins
- Target platforms: Windows, Linux (via Tauri) + Android (via Capacitor)
- Hosted backend (for mobile + web): provider TBD — all mobile/web API calls must use a runtime-configurable base URL

---

## Pre-flight checklist

Before touching any platform config, verify these are done. If any are not, do them first.

- [ ] `frontend/src/lib/api.ts` reads `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api"` — no hardcoded URL
- [ ] `frontend/.env.local` exists and contains `VITE_API_BASE_URL=http://localhost:8000/api`
- [ ] `frontend/.env.example` exists and contains `VITE_API_BASE_URL=http://your-api-url/api`
- [ ] `frontend/.env.local` is in `.gitignore`
- [ ] `npm run build` completes without errors from inside `frontend/`

---

## Phase 1 — Tauri desktop app (Windows, Linux)

### What Tauri does

Tauri wraps the Vite-built frontend in a native OS window using the system webview (no bundled Chromium). The backend runs as a **sidecar** — a separate process that Tauri starts and stops alongside the app window. The user never starts the backend manually.

### 1.1 Install Tauri prerequisites

These must be installed on the developer's machine before any Tauri commands will work.

**Windows:**

```powershell
# Install Rust (required by Tauri)
winget install Rustlang.Rustup
rustup default stable

# Install Visual Studio C++ build tools (if not already present)
# Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
# Select: "Desktop development with C++"
```

**Linux:**

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup default stable
```

Verify: `rustc --version` and `cargo --version` should both return version strings.

### 1.2 Add Tauri to the frontend project

Run from inside `frontend/`:

```powershell
npm install --save-dev @tauri-apps/cli@latest
npm install @tauri-apps/api@latest
npx tauri init
```

When `tauri init` prompts:

- App name: `Daggerheart Companion`
- Window title: `Daggerheart Companion`
- Where are your web assets relative to `src-tauri/tauri.conf.json`?: `../dist`
- Dev server URL: `http://localhost:5173`
- Dev command: `npm run dev`
- Build command: `npm run build`

This creates `frontend/src-tauri/` containing:

```
src-tauri/
  Cargo.toml
  Cargo.lock
  tauri.conf.json
  build.rs
  src/
    main.rs
    lib.rs
```

### 1.3 Configure tauri.conf.json

Edit `frontend/src-tauri/tauri.conf.json`. Set the following — leave all other generated fields as-is:

```json
{
  "productName": "daggerheart-companion",
  "version": "0.1.0",
  "identifier": "com.daggerheart.companion",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:5173",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "windows": [
      {
        "title": "Daggerheart Companion",
        "width": 1280,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "resizable": true
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.ico"
    ]
  }
}
```

### 1.4 Configure the backend sidecar

The sidecar bundles the FastAPI backend so it starts automatically with the desktop app.

**Step 1 — Build a standalone backend executable**

From inside `backend/`:

```powershell
# Install PyInstaller
.venv\Scripts\python.exe -m pip install pyinstaller

# Build the executable
.venv\Scripts\python.exe -m PyInstaller --onefile --name daggerheart-backend app/main.py
```

This produces `backend/dist/daggerheart-backend.exe` (Windows) or `backend/dist/daggerheart-backend` (Linux).

**Step 2 — Register the sidecar in Tauri config**

Add to `frontend/src-tauri/tauri.conf.json` under `"app"`:

```json
"bundle": {
  "externalBin": [
    "binaries/daggerheart-backend"
  ]
}
```

**Step 3 — Copy the binary into the Tauri binaries folder**

Tauri expects platform-tagged binaries. Create the folder and copy:

```powershell
# Windows
mkdir frontend\src-tauri\binaries
copy backend\dist\daggerheart-backend.exe frontend\src-tauri\binaries\daggerheart-backend-x86_64-pc-windows-msvc.exe
```

```bash
# Linux
mkdir -p frontend/src-tauri/binaries
cp backend/dist/daggerheart-backend frontend/src-tauri/binaries/daggerheart-backend-x86_64-unknown-linux-gnu
```

**Step 4 — Start and stop the sidecar from Rust**

Replace the contents of `frontend/src-tauri/src/lib.rs` with:

```rust
use tauri::Manager;
use tauri_plugin_shell::ShellExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let sidecar = app.shell().sidecar("daggerheart-backend").unwrap();
            let (_rx, _child) = sidecar.spawn().expect("Failed to start backend sidecar");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

Add the shell plugin to `frontend/src-tauri/Cargo.toml` under `[dependencies]`:

```toml
tauri-plugin-shell = "2"
```

Add the plugin permission to `frontend/src-tauri/tauri.conf.json` under `"app"`:

```json
"security": {
  "capabilities": [
    {
      "identifier": "default",
      "description": "Default permissions",
      "windows": ["main"],
      "permissions": ["shell:allow-execute", "shell:allow-spawn"]
    }
  ]
}
```

### 1.5 Set the API URL for desktop builds

In the desktop app, the backend runs locally on port 8000. Add a desktop-specific env file:

Create `frontend/.env.desktop`:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

Add a desktop dev script to `frontend/package.json`:

```json
"scripts": {
  "dev": "vite",
  "dev:desktop": "tauri dev",
  "build": "tsc -b && vite build",
  "build:desktop": "tauri build",
  "preview": "vite preview"
}
```

### 1.6 Verify Tauri dev mode

```powershell
cd frontend
npm run dev:desktop
```

Expected: a native app window opens showing the React app. The backend sidecar should start automatically. Check `http://localhost:8000/characters` in a browser to confirm the backend is running.

### 1.7 Build desktop installers

```powershell
cd frontend
npm run build:desktop
```

Outputs (inside `frontend/src-tauri/target/release/bundle/`):

- Windows: `.msi` and `.exe` installers
- Linux: `.deb`, `.rpm`, `.AppImage`

Note: Linux builds must be run on Linux. Use GitHub Actions with a Linux runner for CI if building on Windows.

---

## Phase 2 — Capacitor mobile app (Android)

### What Capacitor does

Capacitor wraps the same Vite-built `dist/` folder in a native Android shell. Unlike Tauri, there is no sidecar — the backend must be hosted remotely. The mobile app talks to the hosted API over HTTPS.

### 2.1 Install Capacitor

Run from inside `frontend/`:

```powershell
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npx cap init
```

When `cap init` prompts:

- App name: `Daggerheart Companion`
- App ID: `com.daggerheart.companion`
- Web asset directory: `dist`

This adds a `capacitor.config.ts` to `frontend/`.

### 2.2 Configure capacitor.config.ts

Replace the generated file contents with:

```typescript
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.daggerheart.companion",
  appName: "Daggerheart Companion",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
```

### 2.3 Set the API URL for mobile builds

Mobile builds must point at the hosted backend. Create `frontend/.env.mobile`:

```
VITE_API_BASE_URL=https://your-api-host/api
```

Replace `https://your-api-host/api` with the real URL once the backend is deployed. See Phase 3 for backend hosting.

Add mobile build scripts to `frontend/package.json`:

```json
"scripts": {
  "dev": "vite",
  "dev:desktop": "tauri dev",
  "build": "tsc -b && vite build",
  "build:desktop": "tauri build",
  "build:mobile": "tsc -b && vite build --mode mobile",
  "preview": "vite preview"
}
```

Add a Vite mode config for mobile. Create `frontend/vite.config.mobile.ts`:

```typescript
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
        env.VITE_API_BASE_URL,
      ),
    },
  };
});
```

### 2.4 Add Android platform

```powershell
cd frontend

# Build the web assets first — Capacitor copies dist/ into the native projects
npm run build:mobile

# Add the Android platform
npx cap add android
```

This creates `frontend/android/` — a standard Android Studio project.

### 2.5 Sync web assets to native projects

Run this every time after building:

```powershell
cd frontend
npm run build:mobile
npx cap sync
```

`cap sync` copies `dist/` into both native projects and updates Capacitor plugins.

### 2.6 Open in native IDEs

```powershell
# Open in Android Studio
npx cap open android
```

From Android Studio: select a virtual device or physical device, press Run.

**Prerequisites:**

- Android Studio with SDK 33+ installed

### 2.7 Handle CORS on the hosted backend

The hosted FastAPI backend must allow requests from the Capacitor app origin. Edit `backend/app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",       # Vite dev
        "http://localhost:1420",       # Tauri dev
        "http://localhost",            # Capacitor Android
        "https://your-web-domain.com", # Production web — replace with real domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Phase 3 — Hosted backend (required for mobile + web)

The hosted backend is a prerequisite for mobile builds to function. The specific hosting provider is TBD — this section documents the requirements so any provider can be used.

### Requirements

- Python 3.11+ runtime
- Ability to run: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Persistent storage volume for the SQLite database file (or migrate to PostgreSQL for production)
- HTTPS endpoint (required by Capacitor's `androidScheme: 'https'`)
- Environment variable support for secrets

### Files to prepare before deployment

**Create `backend/Procfile`** (used by most hosting providers):

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Create `backend/runtime.txt`**:

```
python-3.11
```

**Verify `backend/requirements.txt`** includes all dependencies. Regenerate if needed:

```powershell
cd backend
.venv\Scripts\python.exe -m pip freeze > requirements.txt
```

### After deployment

1. Copy the live HTTPS URL
2. Update `frontend/.env.mobile`: `VITE_API_BASE_URL=https://your-live-url/api`
3. Update the CORS `allow_origins` list in `backend/app/main.py` with the live domain
4. Rebuild and sync: `npm run build:mobile && npx cap sync`

---

## Phase 4 — Web deployment

The web app is the same Vite build used by Capacitor. No additional framework changes are needed.

### Build for web

```powershell
cd frontend
npm run build
```

The `dist/` folder is a static site that can be served from any static host (Vercel, Netlify, Cloudflare Pages, etc.).

### Environment variable for web

Create `frontend/.env.production`:

```
VITE_API_BASE_URL=https://your-live-api-url/api
```

Most static hosts allow setting environment variables in their dashboard — set `VITE_API_BASE_URL` there rather than committing `.env.production` to the repo.

---

## Phase 5 — Update start scripts

Once all platforms are added, update the existing start scripts.

**`backend/start-backend.ps1`** — no changes needed for local dev. For production this script is unused (hosting provider manages startup).

**`frontend/start-frontend.ps1`** — add a platform flag so devs can choose what to start:

```powershell
param(
    [string]$Platform = "web"
)

switch ($Platform) {
    "web"     { npm run dev }
    "desktop" { npm run dev:desktop }
    default   { Write-Error "Unknown platform: $Platform. Use 'web' or 'desktop'." }
}
```

Usage:

```powershell
frontend\start-frontend.ps1            # web (default)
frontend\start-frontend.ps1 -Platform desktop  # Tauri desktop
```

---

## File additions summary

After all phases, these new files and folders will exist:

```
frontend/
  src-tauri/                         ← created by tauri init
    Cargo.toml
    Cargo.lock
    tauri.conf.json
    build.rs
    src/
      main.rs
      lib.rs
    binaries/
      daggerheart-backend-{target}   ← copied from backend/dist/
    icons/                           ← generated by tauri init
  android/                           ← created by cap add android
  capacitor.config.ts                ← created by cap init
  vite.config.mobile.ts              ← new
  .env.local                         ← already exists (local dev)
  .env.desktop                       ← new (desktop local dev)
  .env.mobile                        ← new (mobile/hosted backend)
  .env.production                    ← new (web production)
  .env.example                       ← already exists

backend/
  Procfile                           ← new (hosting deployment)
  runtime.txt                        ← new (hosting deployment)
```

---

## Completed-phase checklist

### Phase 1 — Tauri desktop

- [ ] Rust installed and `rustc --version` returns a version
- [ ] `npx tauri init` completed without errors
- [ ] `tauri.conf.json` updated with correct app identifier and window settings
- [ ] PyInstaller build of backend produces a working executable
- [ ] Platform-tagged binary copied into `src-tauri/binaries/`
- [ ] `lib.rs` updated to spawn the sidecar
- [ ] `npm run dev:desktop` opens a native window with the app running
- [ ] `npm run build:desktop` produces installer files

### Phase 2 — Capacitor Android

- [ ] `npx cap init` completed
- [ ] `capacitor.config.ts` configured
- [ ] `npm run build:mobile` succeeds
- [ ] `npx cap add android` completed
- [ ] `npx cap sync` runs without errors
- [ ] App runs in Android Emulator via Android Studio
- [ ] CORS updated in `backend/app/main.py`

### Phase 3 — Hosted backend

- [ ] `Procfile` and `runtime.txt` created
- [ ] `requirements.txt` is current
- [ ] Backend deployed and HTTPS URL confirmed live
- [ ] `VITE_API_BASE_URL` updated in `.env.mobile` with live URL
- [ ] CORS updated with live domain
- [ ] Mobile app rebuilt and synced against live backend

### Phase 4 — Web deployment

- [ ] `VITE_API_BASE_URL` set in hosting provider dashboard
- [ ] `npm run build` produces clean `dist/`
- [ ] Static `dist/` deployed and accessible at public URL

### Phase 5 — Scripts

- [ ] `start-frontend.ps1` updated with `-Platform` parameter
- [ ] README updated with new platform commands
