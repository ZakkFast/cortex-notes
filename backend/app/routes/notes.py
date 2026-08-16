from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import BacklinkRead, KnowledgeGraphRead, NoteCreate, NoteRead, NoteUpdate
from app.services import notes as note_service

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.get("", response_model=list[NoteRead])
def list_notes(
    search: str = Query(default="", max_length=200),
    trash: bool = False,
    db: Session = Depends(get_db),
) -> list[NoteRead]:
    return note_service.list_notes(db, search=search, trash=trash)


@router.post("", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
def create_note(payload: NoteCreate, db: Session = Depends(get_db)) -> NoteRead:
    return note_service.create_note(db, payload)


@router.get("/graph", response_model=KnowledgeGraphRead)
def knowledge_graph(db: Session = Depends(get_db)) -> KnowledgeGraphRead:
    return note_service.get_knowledge_graph(db)


@router.get("/{note_id}", response_model=NoteRead)
def get_note(note_id: str, db: Session = Depends(get_db)) -> NoteRead:
    return note_service.get_note(db, note_id)


@router.patch("/{note_id}", response_model=NoteRead)
def update_note(note_id: str, payload: NoteUpdate, db: Session = Depends(get_db)) -> NoteRead:
    return note_service.update_note(db, note_id, payload)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: str, db: Session = Depends(get_db)) -> Response:
    note_service.soft_delete_note(db, note_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{note_id}/restore", response_model=NoteRead)
def restore_note(note_id: str, db: Session = Depends(get_db)) -> NoteRead:
    return note_service.restore_note(db, note_id)


@router.get("/{note_id}/backlinks", response_model=list[BacklinkRead])
def backlinks(note_id: str, db: Session = Depends(get_db)) -> list[BacklinkRead]:
    notes = note_service.get_backlinks(db, note_id)
    return [BacklinkRead(id=note.id, title=note.title, updated_at=note.updated_at) for note in notes]
