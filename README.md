# Cortex

Cortex is a private, dark-mode-only notes and knowledge-linking app for the Zakk OS homelab.

## MVP

- create, edit, and soft-delete notes
- Markdown writing and preview
- `[[wiki-style links]]`
- backlinks
- title/content search
- tags
- recent notes
- trash and restore
- autosave with useful save-state feedback
- customizable accent color
- REST API for future Atlas integration
- PostgreSQL persistence
- Docker Compose deployment
- `/health` endpoint

## Stack

- React + TypeScript + Vite
- FastAPI + Python
- PostgreSQL
- SQLAlchemy + Alembic
- custom BEM CSS
- Docker Compose

## Development

Copy the example environment file:

```bash
cp .env.example .env
```

Set a real local `POSTGRES_PASSWORD`, then run:

```bash
docker compose up --build
```

Open:

```text
http://localhost:3100/notes/
```

The API is available through the frontend proxy at `/notes/api/` and directly on loopback at `http://localhost:3101/api/`.

## Production layout

Cortex follows Zakk OS service contract v1:

```text
/srv/apps/cortex/source
/srv/apps/cortex/data
/etc/zakkos/secrets/cortex.env
```

TrashBox owns live state. The Git checkout is disposable. PostgreSQL data is stored beneath `/srv/apps/cortex/data` through `CORTEX_DATA_DIR`.

## TrashBox main and dev workflow

Install the checked-in helper once:

```bash
sudo install -m 755 scripts/cortex /usr/local/bin/cortex
```

Create the isolated dev environment once:

```bash
cortex init-dev
```

The regular commands are:

```text
cortex main
cortex dev
cortex seed
cortex wipe
cortex stop
cortex status
```

`main` uses `/etc/zakkos/secrets/cortex.env`, the `cortex-main` Compose project, and `/srv/apps/cortex/data`.

`dev` uses `/etc/zakkos/secrets/cortex-dev.env`, the `cortex-dev` Compose project, the `dev` Git branch, the `cortex_dev` PostgreSQL database, and `/srv/apps/cortex-dev/data`.

`cortex seed` replaces the dev notes with 52 deterministic fake notes containing tags, wiki links, backlinks, graph connections, search text, and Trash fixtures. `cortex wipe` removes notes from the dev database while leaving application settings alone.

Dev data commands have multiple guards: they require the source checkout to be on the `dev` branch, the dev env file, an explicit dev-tools flag, and a database named exactly `cortex_dev`. They refuse to run against the main `cortex` database.

## Tests

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
pytest
```

Frontend:

```bash
cd frontend
npm install
npm test
npm run build
```

## Design

Cortex is intentionally restrained: dark charcoal surfaces, thin borders, sharp geometry, readable density, minimal motion, and one configurable accent color. It does not use Tailwind, Bootstrap, component-library themes, glassmorphism, or decorative gradients.
