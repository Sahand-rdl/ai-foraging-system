import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import sessionmaker, Session, relationship, declarative_base
from typing import List, Optional
import os
import shutil
import urllib.request
from urllib.parse import urlparse

# --- Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./database.db"

# connect_args={"check_same_thread": False} is needed for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# UPDATED: Use the new location for declarative_base
Base = declarative_base()

# --- SQL Models (Tables) ---
class ProjectDB(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)

    papers = relationship("PaperDB", back_populates="project", cascade="all, delete-orphan")

class PaperDB(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    release_year = Column(Integer)
    authors = Column(String)
    file_path = Column(String)
    
    project_id = Column(Integer, ForeignKey("projects.id"))
    project = relationship("ProjectDB", back_populates="papers")

# Create tables
Base.metadata.create_all(bind=engine)

# --- Pydantic Models (Data Validation) ---

class PaperSchema(BaseModel):
    id: int
    title: str
    release_year: int
    authors: str
    file_path: str
    project_id: int

    # UPDATED: Pydantic V2 syntax
    model_config = ConfigDict(from_attributes=True)

class PaperCreate(BaseModel):
    title: str
    release_year: int
    authors: str
    file_path: str

class PaperDownload(BaseModel):
    url: str
    title: Optional[str] = None
    release_year: Optional[int] = None
    authors: Optional[str] = None

class ProjectSchema(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    papers: List[PaperSchema] = []

    # UPDATED: Pydantic V2 syntax
    model_config = ConfigDict(from_attributes=True)

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

# --- FastAPI App ---
app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Endpoints ---

@app.post("/projects/", response_model=ProjectSchema)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    db_project = ProjectDB(**project.model_dump()) # UPDATED: .dict() is deprecated
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects/", response_model=List[ProjectSchema])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    projects = db.query(ProjectDB).offset(skip).limit(limit).all()
    return projects

@app.post("/projects/{project_id}/papers/", response_model=PaperSchema)
def create_paper_for_project(
    project_id: int, paper: PaperCreate, db: Session = Depends(get_db)
):
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # UPDATED: .dict() -> .model_dump()
    db_paper = PaperDB(**paper.model_dump(), project_id=project_id)
    db.add(db_paper)
    db.commit()
    db.refresh(db_paper)
    return db_paper

@app.get("/papers/{paper_id}", response_model=PaperSchema)
def read_paper(paper_id: int, db: Session = Depends(get_db)):
    paper = db.query(PaperDB).filter(PaperDB.id == paper_id).first()
    if paper is None:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper

@app.post("/projects/{project_id}/papers/download", response_model=PaperSchema)
def download_paper_for_project(
    project_id: int, paper_request: PaperDownload, db: Session = Depends(get_db)
):
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    parsed_url = urlparse(paper_request.url)
    filename = os.path.basename(parsed_url.path)
    if not filename.lower().endswith('.pdf'):
        filename += '.pdf'
    
    filename = "".join([c for c in filename if c.isalpha() or c.isdigit() or c in (' ', '.', '_', '-')]).strip()
    if not filename:
        filename = "downloaded_paper.pdf"

    save_dir = f"papers/{project_id}"
    os.makedirs(save_dir, exist_ok=True)
    file_path = os.path.join(save_dir, filename)

    try:
        # Create a request object with a User-Agent header to avoid 403 Forbidden errors
        req = urllib.request.Request(
            paper_request.url, 
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req) as response, open(file_path, 'wb') as out_file:
            shutil.copyfileobj(response, out_file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download file: {str(e)}")

    db_paper = PaperDB(
        title=paper_request.title or filename,
        release_year=paper_request.release_year or 0,
        authors=paper_request.authors or "Unknown",
        file_path=file_path,
        project_id=project_id
    )
    db.add(db_paper)
    db.commit()
    db.refresh(db_paper)
    return db_paper

# --- UPDATED: Entry Point ---
# This allows you to run "python main.py" directly
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)