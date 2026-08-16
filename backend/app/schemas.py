from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class NoteCreate(BaseModel):
    title: str | None = None
    content: str = ""
    tags: list[str] = Field(default_factory=list)


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    tags: list[str] | None = None


class NoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    content: str
    tags: list[str]
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class BacklinkRead(BaseModel):
    id: str
    title: str
    updated_at: datetime


class SettingsRead(BaseModel):
    accent_color: str


class SettingsUpdate(BaseModel):
    accent_color: str

    @field_validator("accent_color")
    @classmethod
    def validate_accent_color(cls, value: str) -> str:
        normalized = value.strip().lower()
        if len(normalized) != 7 or not normalized.startswith("#"):
            raise ValueError("Accent color must be a six-digit hex color")
        try:
            int(normalized[1:], 16)
        except ValueError as exc:
            raise ValueError("Accent color must be a six-digit hex color") from exc
        return normalized
