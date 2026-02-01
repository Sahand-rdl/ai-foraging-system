"""Knowledge Source endpoints."""
import os
import shutil
import urllib.request
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException, Depends, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Optional

from config import settings
from database import get_db
from models import KnowledgeSourceDB, ProjectDB
from schemas import (
    KnowledgeSourceSchema,
    KnowledgeSourceCreate,
    KnowledgeSourceDownload,
    KnowledgeSourcePathQuery,
)

router = APIRouter(prefix="/knowledge-sources", tags=["knowledge-sources"])


@router.post("/", response_model=KnowledgeSourceSchema)
def create_knowledge_source(ks: KnowledgeSourceCreate, db: Session = Depends(get_db)):
    """Create a new knowledge source."""
    db_ks = KnowledgeSourceDB(**ks.model_dump())
    db.add(db_ks)
    db.commit()
    db.refresh(db_ks)
    return db_ks


@router.post("/bulk-lookup", response_model=Dict[str, Optional[int]])
def get_knowledge_source_ids(
    query: KnowledgeSourcePathQuery, db: Session = Depends(get_db)
):
    """Get KSIDs for a list of file paths. Returns a map of path -> ksid (or None if not found)."""
    results = {}
    
    # Optimize by querying all paths at once
    # We might need to handle large lists, but for now a single IN query is fine
    # Note: paths in DB might be absolute, so exact match is required.
    knowledge_sources = db.query(KnowledgeSourceDB).filter(KnowledgeSourceDB.path.in_(query.paths)).all()
    
    # Create a lookup map from the results
    found_map = {ks.path: ks.id for ks in knowledge_sources}
    
    # innovative response: return all requested paths, with None if not found
    for path in query.paths:
        results[path] = found_map.get(path)
        
    return results



@router.get("/", response_model=List[KnowledgeSourceSchema])
def read_knowledge_sources(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all knowledge sources."""
    sources = db.query(KnowledgeSourceDB).offset(skip).limit(limit).all()
    return sources


@router.get("/{ks_id}", response_model=KnowledgeSourceSchema)
def read_knowledge_source(ks_id: int, db: Session = Depends(get_db)):
    """Get a knowledge source by ID."""
    ks = db.query(KnowledgeSourceDB).filter(KnowledgeSourceDB.id == ks_id).first()
    if ks is None:
        raise HTTPException(status_code=404, detail="Knowledge source not found")
    return ks


@router.get("/{ks_id}/content")
def get_knowledge_source_content(ks_id: int, db: Session = Depends(get_db)):
    """Stream the content of a knowledge source file."""
    ks = db.query(KnowledgeSourceDB).filter(KnowledgeSourceDB.id == ks_id).first()
    if ks is None or not ks.path or not os.path.exists(ks.path):
        raise HTTPException(status_code=404, detail="File not found for this source")
    return FileResponse(
        ks.path,
        media_type="application/pdf",
        filename=os.path.basename(ks.path),
        content_disposition_type="inline",
    )


@router.put("/{ks_id}", response_model=KnowledgeSourceSchema)
def update_knowledge_source(
    ks_id: int, ks_update: KnowledgeSourceCreate, db: Session = Depends(get_db)
):
    """Update a knowledge source."""
    db_ks = db.query(KnowledgeSourceDB).filter(KnowledgeSourceDB.id == ks_id).first()
    if db_ks is None:
        raise HTTPException(status_code=404, detail="Knowledge source not found")
    for key, value in ks_update.model_dump(exclude_unset=True).items():
        setattr(db_ks, key, value)
    db.commit()
    db.refresh(db_ks)
    return db_ks


@router.delete("/{ks_id}", response_model=dict)
def delete_knowledge_source(ks_id: int, db: Session = Depends(get_db)):
    """Delete a knowledge source by KSID (and its artifacts)"""
    db_ks = db.query(KnowledgeSourceDB).filter(KnowledgeSourceDB.id == ks_id).first()
    if db_ks is None:
        raise HTTPException(status_code=404, detail="Knowledge source not found")
    db.delete(db_ks)
    db.commit()
    return {"detail": f"Knowledge source {ks_id} deleted successfully"}


async def download_paper_for_project(
    project_id: int, request: KnowledgeSourceDownload, db: Session = Depends(get_db)
) -> KnowledgeSourceSchema:
    """Download a paper from URL and create a KnowledgeSource linked to the project."""
    # Verify project exists
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Parse URL and generate filename
    parsed_url = urlparse(request.url)
    filename = os.path.basename(parsed_url.path)
    if not filename.lower().endswith('.pdf'):
        filename += '.pdf'
    
    # Sanitize filename
    filename = "".join([c for c in filename if c.isalpha() or c.isdigit() or c in (' ', '.', '_', '-')]).strip()
    if not filename:
        filename = "downloaded_paper.pdf"

    # Create save directory using configured papers path (raw subfolder for PDFs)
    save_dir = settings.get_raw_papers_path(project_id)
    os.makedirs(save_dir, exist_ok=True)
    file_path = os.path.join(save_dir, filename)

    # Download the file
    try:
        req = urllib.request.Request(
            request.url, 
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req) as response, open(file_path, 'wb') as out_file:
            shutil.copyfileobj(response, out_file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download file: {str(e)}")

    # Create KnowledgeSource entry
    db_ks = KnowledgeSourceDB(
        path=file_path,
        source_metadata=request.source_metadata,
        trustworthiness=request.trustworthiness,  # None = not evaluated
        is_favourite=False
    )
    db.add(db_ks)
    db.commit()
    db.refresh(db_ks)


    # Link KnowledgeSource to project
    project.knowledge_sources.append(db_ks)
    db.commit()
    
    # 4. Trigger LLM Processing
    from services.llm_processing import process_document, update_source_with_processing_results
    
    project_def = project.ml_project_definition or f"Project: {project.name}"
    
    processing_result = await process_document(project_def, file_path)
    
    if processing_result:
        update_source_with_processing_results(db, db_ks, processing_result)
        
    db.refresh(db_ks)
    return db_ks


async def upload_paper_for_project(
    project_id: int, file: UploadFile, db: Session = Depends(get_db)
) -> KnowledgeSourceSchema:
    """Upload a paper file and create a KnowledgeSource linked to the project."""
    # Verify project exists
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Generate filename from uploaded file
    filename = file.filename
    if not filename:
        filename = "uploaded_paper.pdf"
    
    # Sanitize filename
    filename = "".join([c for c in filename if c.isalpha() or c.isdigit() or c in (' ', '.', '_', '-')]).strip()
    
    # Create save directory using configured papers path (raw subfolder for PDFs)
    save_dir = settings.get_raw_papers_path(project_id)
    os.makedirs(save_dir, exist_ok=True)
    file_path = os.path.join(save_dir, filename)

    # Save the file
    try:
        with open(file_path, 'wb') as out_file:
            shutil.copyfileobj(file.file, out_file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to save file: {str(e)}")

    # Create KnowledgeSource entry
    db_ks = KnowledgeSourceDB(
        path=file_path,
        source_metadata={"original_filename": file.filename, "upload_method": "direct_upload"},
        trustworthiness=None,  # None = not evaluated
        is_favourite=False
    )
    db.add(db_ks)
    db.commit()
    db.refresh(db_ks)

    # Link KnowledgeSource to project
    project.knowledge_sources.append(db_ks)
    db.commit()
    
    # 4. Trigger LLM Processing
    from services.llm_processing import process_document, update_source_with_processing_results
    
    project_def = project.ml_project_definition or f"Project: {project.name}"
    
    processing_result = await process_document(project_def, file_path)
    
    if processing_result:
        update_source_with_processing_results(db, db_ks, processing_result)
        
    db.refresh(db_ks)
    return db_ks