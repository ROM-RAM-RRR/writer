import json
import os
from typing import List, Optional
from app.models.outline import Outline, OutlineCreate
from datetime import datetime
import uuid


OUTLINES_DIR = "data/outlines"


class OutlineService:
    def __init__(self):
        os.makedirs(OUTLINES_DIR, exist_ok=True)

    def _get_file_path(self, outline_id: str) -> str:
        return os.path.join(OUTLINES_DIR, f"{outline_id}.json")

    def list_outlines(self, project_id: Optional[str] = None) -> List[Outline]:
        outlines = []
        for filename in os.listdir(OUTLINES_DIR):
            if filename.endswith(".json"):
                with open(self._get_file_path(filename[:-5]), "r", encoding="utf-8") as f:
                    outline = Outline(**json.load(f))
                    if project_id is None or outline.project_id == project_id:
                        outlines.append(outline)
        return sorted(outlines, key=lambda o: o.created_at, reverse=True)

    def get_outline(self, outline_id: str) -> Optional[Outline]:
        filepath = self._get_file_path(outline_id)
        if not os.path.exists(filepath):
            return None
        with open(filepath, "r", encoding="utf-8") as f:
            return Outline(**json.load(f))

    def create_outline(self, outline_data: OutlineCreate, project_id: Optional[str] = None) -> Outline:
        outline_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        outline = Outline(
            id=outline_id,
            title=outline_data.title,
            genre=outline_data.genre,
            plot=outline_data.plot,
            characters=outline_data.characters,
            highlights=outline_data.highlights,
            chapters=outline_data.chapters,
            source_theme=outline_data.source_theme,
            content=outline_data.content,
            created_at=now,
            project_id=project_id,
        )
        with open(self._get_file_path(outline_id), "w", encoding="utf-8") as f:
            json.dump(outline.model_dump(), f, ensure_ascii=False, indent=2)
        return outline

    def update_outline(self, outline_id: str, outline_data: OutlineCreate, project_id: Optional[str] = None) -> Optional[Outline]:
        outline = self.get_outline(outline_id)
        if not outline:
            return None
        now = datetime.now().isoformat()
        outline.title = outline_data.title
        outline.genre = outline_data.genre
        outline.plot = outline_data.plot
        outline.characters = outline_data.characters
        outline.highlights = outline_data.highlights
        outline.chapters = outline_data.chapters
        outline.source_theme = outline_data.source_theme
        if outline_data.content:
            outline.content = outline_data.content
        if project_id:
            outline.project_id = project_id
        with open(self._get_file_path(outline_id), "w", encoding="utf-8") as f:
            json.dump(outline.model_dump(), f, ensure_ascii=False, indent=2)
        return outline

    def delete_outline(self, outline_id: str) -> bool:
        filepath = self._get_file_path(outline_id)
        if not os.path.exists(filepath):
            return False
        os.remove(filepath)
        return True


outline_service = OutlineService()