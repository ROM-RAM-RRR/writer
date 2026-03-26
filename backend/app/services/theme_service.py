import json
import os
from typing import List, Optional
from app.models.theme import Theme, ThemeCreate
from datetime import datetime
import uuid


THEMES_DIR = "data/themes"


class ThemeService:
    def __init__(self):
        os.makedirs(THEMES_DIR, exist_ok=True)

    def _get_file_path(self, theme_id: str) -> str:
        return os.path.join(THEMES_DIR, f"{theme_id}.json")

    def list_themes(self) -> List[Theme]:
        themes = []
        for filename in os.listdir(THEMES_DIR):
            if filename.endswith(".json"):
                with open(self._get_file_path(filename[:-5]), "r", encoding="utf-8") as f:
                    themes.append(Theme(**json.load(f)))
        return themes

    def get_theme(self, theme_id: str) -> Optional[Theme]:
        filepath = self._get_file_path(theme_id)
        if not os.path.exists(filepath):
            return None
        with open(filepath, "r", encoding="utf-8") as f:
            return Theme(**json.load(f))

    def create_theme(self, theme_data: ThemeCreate) -> Theme:
        theme_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        theme = Theme(
            id=theme_id,
            name=theme_data.name,
            genre=theme_data.genre,
            style=theme_data.style,
            background=theme_data.background,
            characters=theme_data.characters,
            other_settings=theme_data.other_settings,
            created_at=now,
            updated_at=now,
        )
        with open(self._get_file_path(theme_id), "w", encoding="utf-8") as f:
            json.dump(theme.model_dump(), f, ensure_ascii=False, indent=2)
        return theme

    def update_theme(self, theme_id: str, theme_data: ThemeCreate) -> Optional[Theme]:
        theme = self.get_theme(theme_id)
        if not theme:
            return None
        now = datetime.now().isoformat()
        theme.name = theme_data.name
        theme.genre = theme_data.genre
        theme.style = theme_data.style
        theme.background = theme_data.background
        theme.characters = theme_data.characters
        theme.other_settings = theme_data.other_settings
        theme.updated_at = now
        with open(self._get_file_path(theme_id), "w", encoding="utf-8") as f:
            json.dump(theme.model_dump(), f, ensure_ascii=False, indent=2)
        return theme

    def delete_theme(self, theme_id: str) -> bool:
        filepath = self._get_file_path(theme_id)
        if not os.path.exists(filepath):
            return False
        os.remove(filepath)
        return True


theme_service = ThemeService()