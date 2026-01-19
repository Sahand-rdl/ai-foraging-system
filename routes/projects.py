"""Project endpoints."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import ProjectDB, ResearcherDB, KnowledgeSourceDB
from schemas import ProjectSchema, ProjectCreate

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("/", response_model=ProjectSchema)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project."""
    db_project = ProjectDB(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@router.get("/", response_model=List[ProjectSchema])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all projects."""
    projects = db.query(ProjectDB).offset(skip).limit(limit).all()
    return projects


@router.get("/{project_id}", response_model=ProjectSchema)
def read_project(project_id: int, db: Session = Depends(get_db)):
    """Get a project by ID."""
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(project_id: int, project_update: ProjectCreate, db: Session = Depends(get_db)):
    """Update a project."""
    db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    for key, value in project_update.model_dump(exclude_unset=True).items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project


@router.post("/{project_id}/researchers/{researcher_id}", response_model=ProjectSchema)
def add_researcher_to_project(project_id: int, researcher_id: int, db: Session = Depends(get_db)):
    """Add a researcher to a project."""
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    researcher = db.query(ResearcherDB).filter(ResearcherDB.id == researcher_id).first()
    if not researcher:
        raise HTTPException(status_code=404, detail="Researcher not found")
    
    project.researchers.append(researcher)
    db.commit()
    db.refresh(project)
    return project


@router.post("/{project_id}/knowledge-sources/{ks_id}", response_model=ProjectSchema)
def add_knowledge_source_to_project(project_id: int, ks_id: int, db: Session = Depends(get_db)):
    """Add a knowledge source to a project."""
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    knowledge_source = db.query(KnowledgeSourceDB).filter(KnowledgeSourceDB.id == ks_id).first()
    if not knowledge_source:
        raise HTTPException(status_code=404, detail="Knowledge source not found")
    
    project.knowledge_sources.append(knowledge_source)
    db.commit()
    db.refresh(project)
    return project
