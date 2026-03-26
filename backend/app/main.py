import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="小说写作 Agent API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
from app.api import projects, themes, generate, config

app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(themes.router, prefix="/api/themes", tags=["themes"])
app.include_router(generate.router, prefix="/api/generate", tags=["generate"])
app.include_router(config.router, prefix="/api/config", tags=["config"])

@app.get("/")
async def root():
    return {"message": "小说写作 Agent API"}