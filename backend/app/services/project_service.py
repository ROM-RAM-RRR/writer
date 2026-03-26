import json
import os
from typing import List, Optional
from app.models.project import Project, ProjectCreate, ProjectUpdate
from datetime import datetime
import uuid


PROJECTS_DIR = "data/projects"


class ProjectService:
    def __init__(self):
        os.makedirs(PROJECTS_DIR, exist_ok=True)

    def _get_file_path(self, project_id: str) -> str:
        return os.path.join(PROJECTS_DIR, f"{project_id}.json")

    def list_projects(self) -> List[Project]:
        projects = []
        for filename in os.listdir(PROJECTS_DIR):
            if filename.endswith(".json"):
                with open(self._get_file_path(filename[:-5]), "r", encoding="utf-8") as f:
                    projects.append(Project(**json.load(f)))
        return sorted(projects, key=lambda p: p.updated_at, reverse=True)

    def get_project(self, project_id: str) -> Optional[Project]:
        filepath = self._get_file_path(project_id)
        if not os.path.exists(filepath):
            return None
        with open(filepath, "r", encoding="utf-8") as f:
            return Project(**json.load(f))

    def create_project(self, project_data: ProjectCreate) -> Project:
        project_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        project = Project(
            id=project_id,
            title=project_data.title,
            content=project_data.content,
            theme_id=project_data.theme_id,
            created_at=now,
            updated_at=now,
            history=[],
        )
        with open(self._get_file_path(project_id), "w", encoding="utf-8") as f:
            json.dump(project.model_dump(), f, ensure_ascii=False, indent=2)
        return project

    def update_project(self, project_id: str, project_data: ProjectUpdate) -> Optional[Project]:
        project = self.get_project(project_id)
        if not project:
            return None

        # Save to history before updating
        history_entry = {
            "timestamp": project.updated_at,
            "content": project.content,
        }
        project.history.append(history_entry)

        now = datetime.now().isoformat()
        if project_data.title is not None:
            project.title = project_data.title
        if project_data.content is not None:
            project.content = project_data.content
        if project_data.theme_id is not None:
            project.theme_id = project_data.theme_id
        project.updated_at = now

        with open(self._get_file_path(project_id), "w", encoding="utf-8") as f:
            json.dump(project.model_dump(), f, ensure_ascii=False, indent=2)
        return project

    def delete_project(self, project_id: str) -> bool:
        filepath = self._get_file_path(project_id)
        if not os.path.exists(filepath):
            return False
        os.remove(filepath)
        return True


project_service = ProjectService()