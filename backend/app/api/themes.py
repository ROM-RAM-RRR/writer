from fastapi import APIRouter, HTTPException
from app.models.theme import Theme, ThemeCreate
from app.services.theme_service import theme_service

router = APIRouter()


@router.get("/", response_model=list[Theme])
async def list_themes():
    return theme_service.list_themes()


@router.get("/{theme_id}", response_model=Theme)
async def get_theme(theme_id: str):
    theme = theme_service.get_theme(theme_id)
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    return theme


@router.post("/", response_model=Theme)
async def create_theme(theme: ThemeCreate):
    return theme_service.create_theme(theme)


@router.put("/{theme_id}", response_model=Theme)
async def update_theme(theme_id: str, theme: ThemeCreate):
    updated = theme_service.update_theme(theme_id, theme)
    if not updated:
        raise HTTPException(status_code=404, detail="Theme not found")
    return updated


@router.delete("/{theme_id}")
async def delete_theme(theme_id: str):
    if not theme_service.delete_theme(theme_id):
        raise HTTPException(status_code=404, detail="Theme not found")
    return {"message": "Theme deleted"}