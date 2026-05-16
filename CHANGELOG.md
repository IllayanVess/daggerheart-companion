# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `setup.bat` / `setup.sh` — one-time setup script that runs after cloning. Checks prerequisites (Python, Node.js), creates the Python virtual environment, installs backend and frontend dependencies, seeds the database with initial reference data, and creates `frontend/.env.local` with the correct API URL. Safe to re-run; skips seeding if the database already contains data.
- `launch.bat` / `launch.sh` — convenience launcher that starts both the backend and frontend together in a single command. Supports a `--recreate-db` flag to drop and reseed the database from scratch.
- Initial GitHub preparation: added README setup guidance, CONTRIBUTING, DEVELOPMENT, and GitHub workflow files, CODE_OF_CONDUCT, and CHANGELOG.

### Changed

- `README.md` updated to document the `setup` and `launch` scripts, explain what each does step by step, and move manual setup instructions to a secondary section.
- `DEVELOPMENT.md` updated to document the `setup` and `launch` scripts in full, including the `--recreate-db` flag and the distinction between `launch` (combined) and `start-backend` / `start-frontend` (individual).
