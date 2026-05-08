# Contributing

Thank you for contributing to this project! This repository is intended to be free to use, and all contributions are welcome.

## Getting started

- Open an issue first if you want to propose a change or report a bug.
- Fork the repository and create a feature branch from `main`.
- Keep commits small and focused.
- Use clear commit messages and PR descriptions.

## Local development

Each contributor should run their own local backend. The backend is SQLite-based and is configured per developer using a local environment file.

## Backend setup

1. `cd backend`
2. `python -m venv .venv`
3. `.
venv\Scripts\activate`
4. `python -m pip install -r requirements.txt`

## Frontend setup

1. `cd frontend`
2. `npm install`
3. Copy `frontend/.env.example` to `frontend/.env.local`
4. Set `VITE_API_BASE_URL=http://localhost:8000/api`

## Commit guidelines

- Use present tense and keep messages descriptive.
- Prefix bug fixes with `fix:` and new features with `feat:` when possible.
- Keep unrelated changes in separate commits.

## Pull requests

- Describe the problem and the change.
- Include any setup steps required to verify the change.
- Confirm the frontend build passes and backend dependencies install successfully.
