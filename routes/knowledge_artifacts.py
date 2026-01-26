"""Knowledge Artifact endpoints."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import KnowledgeArtifactDB, KnowledgeSourceDB
from schemas import (
    KnowledgeArtifactSchema,
    KnowledgeArtifactCreate,
    KnowledgeArtifactBase,
    KnowledgeArtifactUpdate,
)

router = APIRouter(prefix="/knowledge-artifacts", tags=["knowledge-artifacts"])


@router.post("/", response_model=KnowledgeArtifactSchema)
def create_knowledge_artifact(artifact: KnowledgeArtifactCreate, db: Session = Depends(get_db)):
    """Create a new knowledge artifact."""
    # Verify knowledge source exists
    ks = db.query(KnowledgeSourceDB).filter(KnowledgeSourceDB.id == artifact.knowledge_source_id).first()
    if not ks:
        raise HTTPException(status_code=404, detail="Knowledge source not found")
    
    db_artifact = KnowledgeArtifactDB(**artifact.model_dump())
    db.add(db_artifact)
    db.commit()
    db.refresh(db_artifact)
    return db_artifact


@router.get("/", response_model=List[KnowledgeArtifactSchema])
def read_knowledge_artifacts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all knowledge artifacts."""
    artifacts = db.query(KnowledgeArtifactDB).offset(skip).limit(limit).all()
    return artifacts


@router.get("/{artifact_id}", response_model=KnowledgeArtifactSchema)
def read_knowledge_artifact(artifact_id: int, db: Session = Depends(get_db)):
    """Get a knowledge artifact by ID."""
    artifact = db.query(KnowledgeArtifactDB).filter(KnowledgeArtifactDB.id == artifact_id).first()
    if artifact is None:
        raise HTTPException(status_code=404, detail="Knowledge artifact not found")
    return artifact


@router.put("/{artifact_id}", response_model=KnowledgeArtifactSchema)
def update_knowledge_artifact(artifact_id: int, artifact_update: KnowledgeArtifactUpdate, db: Session = Depends(get_db)):
    """Update a knowledge artifact."""
    db_artifact = db.query(KnowledgeArtifactDB).filter(KnowledgeArtifactDB.id == artifact_id).first()
    if db_artifact is None:
        raise HTTPException(status_code=404, detail="Knowledge artifact not found")
    
    for key, value in artifact_update.model_dump(exclude_unset=True).items():
        setattr(db_artifact, key, value)
    
    db.commit()
    db.refresh(db_artifact)
    return db_artifact


@router.delete("/{artifact_id}", status_code=204)
def delete_knowledge_artifact(artifact_id: int, db: Session = Depends(get_db)):
    """Delete a knowledge artifact."""
    db_artifact = db.query(KnowledgeArtifactDB).filter(KnowledgeArtifactDB.id == artifact_id).first()
    if db_artifact is None:
        raise HTTPException(status_code=404, detail="Knowledge artifact not found")
    
    db.delete(db_artifact)
    db.commit()
    return None
