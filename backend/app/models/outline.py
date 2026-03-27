from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class OutlineBase(BaseModel):
    title: str
    genre: str
    plot: str
    characters: list[str]
    highlights: str
    chapters: int
    source_theme: Optional[str] = None
    content: Optional[str] = None  # 如果生成了正文内容


class OutlineCreate(OutlineBase):
    pass


class Outline(OutlineBase):
    id: str
    created_at: str
    project_id: Optional[str] = None

    class Config:
        from_attributes = True