from fastapi import APIRouter
from app.services.config_service import config_service

router = APIRouter()


@router.get("/")
async def get_config():
    return config_service.get_config()


@router.post("/")
async def update_config(config: dict):
    return config_service.update_config(config)