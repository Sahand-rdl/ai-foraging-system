"""Project endpoints."""
from fastapi import APIRouter, HTTPException, Depends, UploadFile
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import ProjectDB, ResearcherDB, KnowledgeSourceDB
from schemas import ProjectSchema, ProjectCreate, KnowledgeSourceDownload

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


    project.knowledge_sources.append(knowledge_source)
    db.commit()
    db.refresh(project)
    return project


@router.post("/{project_id}/upload-paper", response_model=ProjectSchema)
async def upload_paper_to_project(
    project_id: int, 
    file: UploadFile, 
    db: Session = Depends(get_db)
):
    """Upload a PDF paper to a project and process it."""
    # 1. Get Project
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # 2. Save File
    from config import settings
    from services.file_management import save_upload_file
    import os
    
    filename = file.filename or "uploaded_paper.pdf"
    raw_path = settings.get_raw_papers_path(project_id)
    file_path = os.path.join(raw_path, filename)
    
    saved_path = await save_upload_file(file, file_path)
    
    # 3. Create Initial Knowledge Source
    ks = KnowledgeSourceDB(
        path=saved_path,
        source_metadata={"filename": filename, "original_filename": filename},
        trustworthiness=None 
    )
    db.add(ks)
    db.commit()
    db.refresh(ks)
    
    # Link to project
    project.knowledge_sources.append(ks)
    db.commit()
    
    # 4. Trigger LLM Processing
    from services.llm_processing import process_document
    
    # Use project definition if available, otherwise just use project name as context
    # ideally we want a proper definition
    project_def = project.ml_project_definition or f"Project: {project.name}"
    
    processing_result = await process_document(project_def, saved_path)
    
    if processing_result:
        print("Processing result:", processing_result)
        # 5. Update Knowledge Source with results
        ks.raw_text = "See extracted artifacts" # Or extract full text if available in response? 
        # The response example has 'extracted_path', maybe we shouldn't store full text in DB if it's large?
        # But for now, let's store what we can.
        
        # Update metadata
        if "metadata" in processing_result:
            current_metadata = dict(ks.source_metadata) if ks.source_metadata else {}
            current_metadata.update(processing_result["metadata"])
            ks.source_metadata = current_metadata
            from sqlalchemy.orm.attributes import flag_modified
            flag_modified(ks, "source_metadata")
            
        # Update tags
        if "tags" in processing_result and processing_result["tags"]:
            ks.tags = ",".join(processing_result["tags"])
            
        # Update trustworthiness
        if "trust_result" in processing_result:
            trust_result = processing_result["trust_result"]
            if isinstance(trust_result, dict):
                ks.trustworthiness = trust_result.get("trustworthiness_score")
                ks.trustworthiness_reason = trust_result.get("reason")
        
        # 6. Create Artifacts
        from models import KnowledgeArtifactDB
        
        if "knowledge_artifacts" in processing_result:
            artifacts_data = processing_result["knowledge_artifacts"]
            
            # Helper to create artifact
            def create_artifact(data, artifact_type):
                # Map fields based on type
                title = "Untitled"
                content = ""
                
                if artifact_type == "terminologies":
                    title = data.get("term", "Untitled")
                    content = data.get("meaning", "")
                    artifact_type_db = "terminology"
                elif artifact_type == "figures":
                    title = data.get("figure", "Untitled")
                    content = data.get("description", "")
                    artifact_type_db = "figure"
                elif artifact_type == "tables":
                    title = data.get("table", "Untitled")
                    if "title" in data:
                         content = f"Title: {data['title']}"
                    else:
                        content = ""
                    artifact_type_db = "table"
                else:
                    title = data.get("title", 'Untitled')
                    content = data.get("content", "")
                    artifact_type_db = artifact_type.rstrip('s') # simple heuristic

                artifact = KnowledgeArtifactDB(
                    type=artifact_type_db,
                    title=title,
                    content=content,
                    status="suggestion",
                    knowledge_source_id=ks.id
                )
                db.add(artifact)

            # Handle parsing (Dictionary of lists)
            if isinstance(artifacts_data, dict):
                for art_type, items in artifacts_data.items():
                    if isinstance(items, list):
                        for item in items:
                            if isinstance(item, dict):
                                create_artifact(item, art_type)
            # Handle legacy list
            elif isinstance(artifacts_data, list):
                 for item in artifacts_data:
                    if isinstance(item, dict):
                        create_artifact(item, item.get("type", "unknown"))
        
        db.commit()
    
    db.refresh(project)
    return project


@router.post("/{project_id}/download-paper", response_model=ProjectSchema)
async def download_paper_to_project(
    project_id: int, 
    download_data: KnowledgeSourceDownload, 
    db: Session = Depends(get_db)
):
    """Download a paper from URL to a project and process it."""
    # 1. Get Project
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # 2. Download File
    from config import settings
    from services.file_management import download_file
    import os
    
    # Extract filename from URL or use default
    filename = download_data.url.split("/")[-1]
    if not filename.endswith(".pdf"):
        filename += ".pdf"
        
    raw_path = settings.get_raw_papers_path(project_id)
    file_path = os.path.join(raw_path, filename)
    
    saved_path = await download_file(download_data.url, file_path)
    
    if not saved_path:
        raise HTTPException(status_code=400, detail=f"Failed to download file from {download_data.url}")
    
    # 3. Create Initial Knowledge Source
    ks = KnowledgeSourceDB(
        path=saved_path,
        source_metadata=download_data.source_metadata or {"url": download_data.url},
        trustworthiness=download_data.trustworthiness 
    )
    db.add(ks)
    db.commit()
    db.refresh(ks)
    
    # Link to project
    project.knowledge_sources.append(ks)
    db.commit()
    
    # 4. Trigger LLM Processing
    from services.llm_processing import process_document
    
    project_def = project.ml_project_definition or f"Project: {project.name}"
    
    processing_result = await process_document(project_def, saved_path)
    
    if processing_result:
        # 5. Update Knowledge Source with results
        # Common logic with upload - could be refactored into a service method
        print("PROCESSING RESULT: ", processing_result)
        # Update metadata
        if "metadata" in processing_result:
            current_metadata = dict(ks.source_metadata) if ks.source_metadata else {}
            current_metadata.update(processing_result["metadata"])
            ks.source_metadata = current_metadata
            from sqlalchemy.orm.attributes import flag_modified
            flag_modified(ks, "source_metadata")

            
        # Update tags
        if "tags" in processing_result and processing_result["tags"]:
            ks.tags = ",".join(processing_result["tags"])
            
        # Update trustworthiness if not set manually
        if ks.trustworthiness is None and "trust_result" in processing_result:
            trust_result = processing_result["trust_result"]
            if isinstance(trust_result, dict):
                ks.trustworthiness = trust_result.get("trustworthiness_score")
                ks.trustworthiness_reason = trust_result.get("reason")
        
        # 6. Create Artifacts
        from models import KnowledgeArtifactDB
        
        if "knowledge_artifacts" in processing_result:
            artifacts_data = processing_result["knowledge_artifacts"]
            
            # Use same helper logic (or could define helper outside). 
            # For simplicity, duplicating helper logic structure here or define function outside if possible.
            # Defining inline again to avoid scope issues or refactor to separate function
            def create_artifact_dl(data, artifact_type):
                title = "Untitled"
                content = ""
                
                if artifact_type == "terminologies":
                    title = data.get("term", "Untitled")
                    content = data.get("meaning", "")
                    artifact_type_db = "terminology"
                elif artifact_type == "figures":
                    title = data.get("figure", "Untitled")
                    content = data.get("description", "")
                    artifact_type_db = "figure"
                elif artifact_type == "tables":
                    title = data.get("table", "Untitled")
                    if "title" in data:
                         content = f"Title: {data['title']}"
                    else:
                        content = ""
                    artifact_type_db = "table"
                else:
                    title = data.get("title", 'Untitled')
                    content = data.get("content", "")
                    artifact_type_db = artifact_type.rstrip('s')

                artifact = KnowledgeArtifactDB(
                    type=artifact_type_db,
                    title=title,
                    content=content,
                    status="suggestion",
                    knowledge_source_id=ks.id
                )
                db.add(artifact)

            if isinstance(artifacts_data, dict):
                for art_type, items in artifacts_data.items():
                    if isinstance(items, list):
                        for item in items:
                            if isinstance(item, dict):
                                create_artifact_dl(item, art_type)
            elif isinstance(artifacts_data, list):
                 for item in artifacts_data:
                    if isinstance(item, dict):
                        create_artifact_dl(item, item.get("type", "unknown"))
        
        db.commit()
    
    db.refresh(project)
    return project
