from fastapi import FastAPI

from app.routes import health, notes, settings

app = FastAPI(title="Cortex API", version="0.1.0")
app.include_router(health.router)
app.include_router(notes.router)
app.include_router(settings.router)
