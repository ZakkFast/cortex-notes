import os
import sys

from sqlalchemy import delete, select
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from app.config import settings
from app.db import SessionLocal
from app.models import Note, NoteLink
from app.schemas import NoteCreate
from app.services.notes import create_note, soft_delete_note

AREAS = [
    ("Atlas", "ai", ["Memory Design", "Tool Routing", "Web Research", "ComfyUI Bridge", "Prompt Experiments"]),
    ("Cortex", "notes", ["Editor Ideas", "Knowledge Graph", "Search Notes", "Mobile UX", "Backlink Ideas"]),
    ("Homelab", "infra", ["TrashBox Services", "Backup Plan", "Private Networking", "Storage Layout", "Deployment Notes"]),
    ("Backend Roadmap", "backend", ["API Design", "Database Patterns", "Health Checks", "Logging Strategy", "Background Jobs"]),
    ("Python Learning", "learning", ["Functions", "Collections", "Testing", "FastAPI Notes", "SQLAlchemy Notes"]),
    ("Career Search", "career", ["Backend Roles", "Interview Prep", "Portfolio Cleanup", "Networking Notes", "Job Market Research"]),
    ("Home Projects", "home", ["Kitchen Plan", "Flooring Plan", "Network Closet", "Hurricane Power", "Office Setup"]),
    ("Game Ideas", "games", ["Combat Notes", "World Building", "Quest Ideas", "Progression Systems", "UI References"]),
]

DELETED_TITLES = ["Old Scratchpad", "Abandoned Feature", "Duplicate Research", "Retired Checklist"]


def assert_dev_database(database_url: str, enabled: str | None) -> None:
    if enabled != "1":
        raise RuntimeError("Dev data tools are disabled. Use the Cortex dev command.")
    database = make_url(database_url).database
    if database != "cortex_dev":
        raise RuntimeError(f"Refusing to modify non-dev database: {database or 'unknown'}")


def build_seed_notes() -> list[NoteCreate]:
    notes: list[NoteCreate] = []
    area_titles = [area[0] for area in AREAS]

    for area_index, (area, tag, topics) in enumerate(AREAS):
        next_area = area_titles[(area_index + 1) % len(area_titles)]
        topic_links = " ".join(f"[[{topic}]]" for topic in topics)
        notes.append(
            NoteCreate(
                title=area,
                tags=[tag, "hub", "seed"],
                content=f"# {area}\n\nA hub note for testing Cortex navigation, search, tags, backlinks, and graph density.\n\n## Topics\n\n{topic_links}\n\nRelated area: [[{next_area}]].",
            )
        )

        for topic_index, topic in enumerate(topics):
            next_topic = topics[(topic_index + 1) % len(topics)]
            notes.append(
                NoteCreate(
                    title=topic,
                    tags=[tag, "seed", "test-data"],
                    content=(
                        f"# {topic}\n\n"
                        f"Working notes for [[{area}]]. This fixture gives Cortex enough text to test search, editing, responsive layouts, and preview rendering.\n\n"
                        f"## Checklist\n\n- Review the current approach\n- Capture open questions\n- Link related material\n- Test this note on desktop and mobile\n\n"
                        f"Next: [[{next_topic}]]\n\nCross-project context: [[{next_area}]]."
                    ),
                )
            )

    for index, title in enumerate(DELETED_TITLES, start=1):
        notes.append(
            NoteCreate(
                title=title,
                tags=["seed", "trash"],
                content=f"# {title}\n\nTemporary fixture {index} used to exercise Cortex Trash and restore behavior.\n\nRelated: [[Cortex]].",
            )
        )

    return notes


def wipe_dev_data(db: Session) -> int:
    count = db.scalar(select(Note).count()) if False else None
    note_count = len(db.scalars(select(Note.id)).all())
    db.execute(delete(NoteLink))
    db.execute(delete(Note))
    db.commit()
    return note_count


def seed_dev_data(db: Session) -> int:
    wipe_dev_data(db)
    created_by_title: dict[str, Note] = {}
    for payload in build_seed_notes():
        note = create_note(db, payload)
        created_by_title[note.title] = note

    for title in DELETED_TITLES:
        soft_delete_note(db, created_by_title[title].id)

    return len(created_by_title)


def main() -> None:
    command = sys.argv[1] if len(sys.argv) == 2 else ""
    if command not in {"seed", "wipe"}:
        raise SystemExit("Usage: python -m app.devdata <seed|wipe>")

    try:
        assert_dev_database(settings.database_url, os.getenv("CORTEX_DEV_TOOLS"))
    except RuntimeError as error:
        raise SystemExit(str(error)) from error

    with SessionLocal() as db:
        if command == "seed":
            count = seed_dev_data(db)
            print(f"Seeded {count} notes into cortex_dev.")
        else:
            count = wipe_dev_data(db)
            print(f"Removed {count} notes from cortex_dev.")


if __name__ == "__main__":
    main()
