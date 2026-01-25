"""Data Service API - Main application entry point."""
import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import ProjectDB, KnowledgeSourceDB
from schemas import KnowledgeSourceSchema, KnowledgeSourceDownload
from routes import (
    researchers_router,
    projects_router,
    knowledge_sources_router,
    knowledge_artifacts_router,
    ai_router,
)
from routes.knowledge_sources import download_paper_for_project

# Create all tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(title="Data Service API", version="2.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(researchers_router)
app.include_router(projects_router)
app.include_router(knowledge_sources_router)
app.include_router(knowledge_artifacts_router)
app.include_router(ai_router)

# Download paper endpoint (special case - under /projects but creates KnowledgeSource)
@app.post("/projects/{project_id}/download-paper", response_model=KnowledgeSourceSchema, tags=["projects"])
def download_paper(project_id: int, request: KnowledgeSourceDownload, db: Session = Depends(get_db)):
    """Download a paper from URL and create a KnowledgeSource linked to the project."""
    return download_paper_for_project(project_id, request, db)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)