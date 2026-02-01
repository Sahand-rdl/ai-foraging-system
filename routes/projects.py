"""Project endpoints."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session, subqueryload
from typing import List

from database import get_db
from models import ProjectDB, ResearcherDB, KnowledgeSourceDB, KnowledgeArtifactDB
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
    """Get all projects with their source and artifact counts."""
    projects_db = (
        db.query(ProjectDB)
        .options(
            subqueryload(ProjectDB.knowledge_sources).subqueryload(
                KnowledgeSourceDB.artifacts
            )
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

    response_projects = []
    for project in projects_db:
        try:
            source_count = len(project.knowledge_sources)
            artifact_count = sum(
                len(source.artifacts) for source in project.knowledge_sources
            )

            project_schema = ProjectSchema.model_validate(project)
            project_schema.source_count = source_count
            project_schema.artifact_count = artifact_count

            response_projects.append(project_schema)
        except Exception as e:
            print(f"ERROR: Could not process project with ID {project.id}: {e}")

    return response_projects


@router.get("/{project_id}", response_model=ProjectSchema)
def read_project(project_id: int, db: Session = Depends(get_db)):
    """Get a project by ID."""
    project = db.query(ProjectDB).options(subqueryload(ProjectDB.knowledge_sources)).filter(ProjectDB.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    # Sort the knowledge_sources by relevance score (descending)
    try:
        project.knowledge_sources.sort(
            key=lambda ks: (ks.source_metadata or {}).get("relevance", 0.0) or 0.0,
            reverse=True
        )
    except Exception as e:
        print(f"Warning: Could not sort knowledge sources for project {project_id}. Error: {e}")
        
    return project


@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(
    project_id: int, project_update: ProjectCreate, db: Session = Depends(get_db)
):
    """Update a project."""
    db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    for key, value in project_update.model_dump(exclude_unset=True).items():
        setattr(db_project, key, value)

    db.commit()
    db.refresh(db_project)
    return db_project


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project."""
    db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(db_project)
    db.commit()
    return None


@router.post("/{project_id}/researchers/{researcher_id}", response_model=ProjectSchema)
def add_researcher_to_project(
    project_id: int, researcher_id: int, db: Session = Depends(get_db)
):
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