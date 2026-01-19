"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any


# --- Researcher Schemas ---
class ResearcherBase(BaseModel):
    name: str
    email: str


class ResearcherCreate(ResearcherBase):
    pass


class ResearcherSchema(ResearcherBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# --- Knowledge Artifact Schemas ---
class KnowledgeArtifactBase(BaseModel):
    type: str
    title: str
    content: Optional[str] = None
    status: Optional[str] = "suggestion"
    tags: Optional[str] = None
    notes: Optional[str] = None
    external_link: Optional[str] = None
    is_bookmarked: Optional[bool] = False
    chat_history: Optional[Any] = None


class KnowledgeArtifactCreate(KnowledgeArtifactBase):
    knowledge_source_id: int


class KnowledgeArtifactSchema(KnowledgeArtifactBase):
    id: int
    knowledge_source_id: int
    model_config = ConfigDict(from_attributes=True)


# --- Knowledge Source Schemas ---
class KnowledgeSourceBase(BaseModel):
    path: str
    source_metadata: Optional[Any] = None
    raw_text: Optional[str] = None
    trustworthiness: Optional[float] = 0.0
    is_favourite: Optional[bool] = False


class KnowledgeSourceCreate(KnowledgeSourceBase):
    pass


class KnowledgeSourceDownload(BaseModel):
    """Schema for downloading a paper and creating a knowledge source."""
    url: str
    source_metadata: Optional[Any] = None
    trustworthiness: Optional[float] = 0.0


class KnowledgeSourceSchema(KnowledgeSourceBase):
    id: int
    artifacts: List[KnowledgeArtifactSchema] = []
    model_config = ConfigDict(from_attributes=True)


class KnowledgeSourceBriefSchema(KnowledgeSourceBase):
    """Brief schema without nested artifacts to avoid circular refs."""
    id: int
    model_config = ConfigDict(from_attributes=True)


# --- Project Schemas ---
class ProjectBase(BaseModel):
    name: str
    ml_project_definition: Optional[str] = None
    tags: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectSchema(ProjectBase):
    id: int
    researchers: List[ResearcherSchema] = []
    knowledge_sources: List[KnowledgeSourceBriefSchema] = []
    model_config = ConfigDict(from_attributes=True)
