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
