from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ThemeBase(BaseModel):
    name: str
    genre: str
    style: str
    background: str
    characters: str
    other_settings: str


class ThemeCreate(ThemeBase):
    pass


class Theme(ThemeBase):
    id: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True