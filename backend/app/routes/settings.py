from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import AppSetting
from app.schemas import SettingsRead, SettingsUpdate

router = APIRouter(prefix="/api/settings", tags=["settings"])
DEFAULT_ACCENT = "#8b9cff"


@router.get("", response_model=SettingsRead)
def get_settings(db: Session = Depends(get_db)) -> SettingsRead:
    setting = db.get(AppSetting, "accent_color")
    return SettingsRead(accent_color=setting.value if setting else DEFAULT_ACCENT)


@router.patch("", response_model=SettingsRead)
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_db)) -> SettingsRead:
    setting = db.get(AppSetting, "accent_color")
    if setting is None:
        setting = AppSetting(key="accent_color", value=payload.accent_color)
        db.add(setting)
    else:
        setting.value = payload.accent_color
    db.commit()
    return SettingsRead(accent_color=setting.value)
