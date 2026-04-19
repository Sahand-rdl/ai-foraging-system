"""Researcher endpoints."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import ResearcherDB
from schemas import ResearcherSchema, ResearcherCreate

router = APIRouter(prefix="/researchers", tags=["researchers"])


@router.post("/", response_model=ResearcherSchema)
def create_researcher(researcher: ResearcherCreate, db: Session = Depends(get_db)):
    """Create a new researcher."""
    db_researcher = ResearcherDB(**researcher.model_dump())
    db.add(db_researcher)
    db.commit()
    db.refresh(db_researcher)
    return db_researcher


@router.get("/", response_model=List[ResearcherSchema])
def read_researchers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all researchers."""
    researchers = db.query(ResearcherDB).offset(skip).limit(limit).all()
    return researchers


@router.get("/{researcher_id}", response_model=ResearcherSchema)
def read_researcher(researcher_id: int, db: Session = Depends(get_db)):
    """Get a researcher by ID."""
    researcher = db.query(ResearcherDB).filter(ResearcherDB.id == researcher_id).first()
    if researcher is None:
        raise HTTPException(status_code=404, detail="Researcher not found")
    return researcher