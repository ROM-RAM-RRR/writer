from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProjectBase(BaseModel):
    title: str
    content: str = ""
    theme_id: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    theme_id: Optional[str] = None


class Project(ProjectBase):
    id: str
    created_at: str
    updated_at: str
    history: list = []

    class Config:
        from_attributes = True