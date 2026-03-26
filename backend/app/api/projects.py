from fastapi import APIRouter, HTTPException
from app.models.project import Project, ProjectCreate, ProjectUpdate
from app.services.project_service import project_service

router = APIRouter()


@router.get("/", response_model=list[Project])
async def list_projects():
    return project_service.list_projects()


@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: str):
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/", response_model=Project)
async def create_project(project: ProjectCreate):
    return project_service.create_project(project)


@router.put("/{project_id}", response_model=Project)
async def update_project(project_id: str, project: ProjectUpdate):
    updated = project_service.update_project(project_id, project)
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    if not project_service.delete_project(project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}