"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, ConfigDict, field_validator
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


class KnowledgeArtifactUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[str] = None
    notes: Optional[str] = None
    external_link: Optional[str] = None
    is_bookmarked: Optional[bool] = None
    chat_history: Optional[Any] = None


class KnowledgeArtifactSchema(KnowledgeArtifactBase):
    id: int
    knowledge_source_id: int
    model_config = ConfigDict(from_attributes=True)



# --- Knowledge Source Schemas ---
class KnowledgeSourceBase(BaseModel):
    path: str
    source_metadata: Optional[Any] = None
    raw_text: Optional[str] = None
    tags: Optional[str] = None
    trustworthiness: Optional[int] = None  # null=not evaluated, 1-3=rating
    trustworthiness_reason: Optional[str] = None
    is_favourite: Optional[bool] = False
    
    @field_validator('trustworthiness')
    @classmethod
    def validate_trustworthiness(cls, v):
        if v is not None and v not in (1, 2, 3):
            raise ValueError('trustworthiness must be null (not evaluated) or 1, 2, or 3')
        return v


class KnowledgeSourceCreate(KnowledgeSourceBase):
    pass


class KnowledgeSourceDownload(BaseModel):
    """Schema for downloading a paper and creating a knowledge source."""
    url: str
    source_metadata: Optional[Any] = None
    trustworthiness: Optional[int] = None  # null=not evaluated, 1-3=rating
    
    @field_validator('trustworthiness')
    @classmethod
    def validate_trustworthiness(cls, v):
        if v is not None and v not in (1, 2, 3):
            raise ValueError('trustworthiness must be null (not evaluated) or 1, 2, or 3')
        return v


class KnowledgeSourceSchema(KnowledgeSourceBase):
    id: int
    artifacts: List[KnowledgeArtifactSchema] = []
    model_config = ConfigDict(from_attributes=True)



class KnowledgeSourceBriefSchema(KnowledgeSourceBase):
    """Brief schema without nested artifacts to avoid circular refs."""
    id: int
    model_config = ConfigDict(from_attributes=True)


class KnowledgeSourcePathQuery(BaseModel):
    paths: List[str]



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


# --- Search Schemas ---
class SearchQuery(BaseModel):
    query: str
    search_type: str  # "keyword" or "semantic"


class SearchResultItem(BaseModel):
    # Enriched data added by the data-service
    id: int  # The ID of the KnowledgeSource in the database
    project_id: int

    # Data from the llm-service
    snippet: Optional[str] = None
    score: Optional[float] = None
    type: Optional[str] = None
    filename: Optional[str] = None


class SearchResponse(BaseModel):
    results: List[SearchResultItem]
