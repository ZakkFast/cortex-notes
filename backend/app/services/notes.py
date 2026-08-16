from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import String, cast, delete, func, or_, select
from sqlalchemy.orm import Session

from app.models import Note, NoteLink
from app.schemas import NoteCreate, NoteUpdate
from app.utils.wiki_links import extract_wiki_links


def list_notes(db: Session, search: str = "", trash: bool = False) -> list[Note]:
    statement = select(Note)
    statement = statement.where(Note.deleted_at.is_not(None) if trash else Note.deleted_at.is_(None))
    query = search.strip()
    if query:
        pattern = f"%{query}%"
        statement = statement.where(
            or_(
                Note.title.ilike(pattern),
                Note.content.ilike(pattern),
                cast(Note.tags, String).ilike(pattern),
            )
        )
    return list(db.scalars(statement.order_by(Note.updated_at.desc())).all())


def get_note(db: Session, note_id: str, include_deleted: bool = True) -> Note:
    note = db.get(Note, note_id)
    if note is None or (not include_deleted and note.deleted_at is not None):
        raise HTTPException(status_code=404, detail="Note not found")
    return note


def create_note(db: Session, payload: NoteCreate) -> Note:
    title = _next_available_title(db, _clean_title(payload.title or "Untitled"))
    note = Note(title=title, content=payload.content, tags=_clean_tags(payload.tags))
    db.add(note)
    db.flush()
    _sync_links(db, note)
    db.commit()
    db.refresh(note)
    return note


def update_note(db: Session, note_id: str, payload: NoteUpdate) -> Note:
    note = get_note(db, note_id, include_deleted=False)
    if payload.title is not None:
        title = _clean_title(payload.title)
        _assert_title_available(db, title, note.id)
        note.title = title
    if payload.content is not None:
        note.content = payload.content
    if payload.tags is not None:
        note.tags = _clean_tags(payload.tags)
    note.updated_at = datetime.now(timezone.utc)
    _sync_links(db, note)
    db.commit()
    db.refresh(note)
    return note


def soft_delete_note(db: Session, note_id: str) -> Note:
    note = get_note(db, note_id, include_deleted=False)
    note.deleted_at = datetime.now(timezone.utc)
    note.updated_at = note.deleted_at
    db.commit()
    db.refresh(note)
    return note


def restore_note(db: Session, note_id: str) -> Note:
    note = get_note(db, note_id)
    if note.deleted_at is None:
        return note
    _assert_title_available(db, note.title, note.id)
    note.deleted_at = None
    note.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(note)
    return note


def get_backlinks(db: Session, note_id: str) -> list[Note]:
    note = get_note(db, note_id, include_deleted=False)
    statement = (
        select(Note)
        .join(NoteLink, Note.id == NoteLink.source_note_id)
        .where(func.lower(NoteLink.target_title) == note.title.lower(), Note.deleted_at.is_(None))
        .order_by(Note.updated_at.desc())
    )
    return list(db.scalars(statement).unique().all())


def _sync_links(db: Session, note: Note) -> None:
    db.execute(delete(NoteLink).where(NoteLink.source_note_id == note.id))
    for target_title in extract_wiki_links(note.content):
        db.add(NoteLink(source_note_id=note.id, target_title=target_title))


def _clean_title(title: str) -> str:
    cleaned = " ".join(title.strip().split())
    if not cleaned:
        raise HTTPException(status_code=422, detail="A note title cannot be empty")
    if len(cleaned) > 255:
        raise HTTPException(status_code=422, detail="A note title cannot exceed 255 characters")
    return cleaned


def _clean_tags(tags: list[str]) -> list[str]:
    cleaned: list[str] = []
    seen: set[str] = set()
    for tag in tags:
        value = " ".join(tag.strip().split())
        key = value.casefold()
        if value and key not in seen:
            cleaned.append(value)
            seen.add(key)
    return cleaned[:30]


def _assert_title_available(db: Session, title: str, current_note_id: str | None = None) -> None:
    statement = select(Note.id).where(func.lower(Note.title) == title.lower(), Note.deleted_at.is_(None))
    existing_id = db.scalar(statement.limit(1))
    if existing_id is not None and existing_id != current_note_id:
        raise HTTPException(status_code=409, detail=f'A note named "{title}" already exists')


def _next_available_title(db: Session, base_title: str) -> str:
    candidate = base_title
    suffix = 2
    while db.scalar(select(Note.id).where(func.lower(Note.title) == candidate.lower(), Note.deleted_at.is_(None)).limit(1)):
        candidate = f"{base_title} {suffix}"
        suffix += 1
    return candidate
