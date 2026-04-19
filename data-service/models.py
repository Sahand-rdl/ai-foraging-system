"""SQLAlchemy ORM models for the data service."""
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, Table, JSON
from sqlalchemy.orm import relationship
from database import Base

# --- Junction Tables ---
project_researcher = Table(
    'project_researcher',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projects.id'), primary_key=True),
    Column('researcher_id', Integer, ForeignKey('researchers.id'), primary_key=True)
)

project_knowledge_source = Table(
    'project_knowledge_source',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projects.id'), primary_key=True),
    Column('knowledge_source_id', Integer, ForeignKey('knowledge_sources.id'), primary_key=True)
)


class ResearcherDB(Base):
    """Researcher model."""
    __tablename__ = "researchers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)

    projects = relationship("ProjectDB", secondary=project_researcher, back_populates="researchers")


class ProjectDB(Base):
    """Project model."""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    ml_project_definition = Column(Text, nullable=True)
    tags = Column(String, nullable=True)  # Comma-separated tags from TF-IDF

    researchers = relationship("ResearcherDB", secondary=project_researcher, back_populates="projects")
    knowledge_sources = relationship("KnowledgeSourceDB", secondary=project_knowledge_source, back_populates="projects")


class KnowledgeSourceDB(Base):
    """Knowledge Source model."""
    __tablename__ = "knowledge_sources"

    id = Column(Integer, primary_key=True, index=True)
    path = Column(String, index=True)  # Path to the source file
    source_metadata = Column(JSON, nullable=True)  # JSON metadata
    raw_text = Column(Text, nullable=True)
    tags = Column(String, nullable=True)  # Comma-separated tags from LLM processing
    trustworthiness = Column(Integer, nullable=True)  # null=not evaluated, 1-3=rating
    trustworthiness_reason = Column(Text, nullable=True)
    is_favourite = Column(Boolean, default=False)

    projects = relationship("ProjectDB", secondary=project_knowledge_source, back_populates="knowledge_sources")
    artifacts = relationship("KnowledgeArtifactDB", back_populates="knowledge_source", cascade="all, delete-orphan")


class KnowledgeArtifactDB(Base):
    """Knowledge Artifact model."""
    __tablename__ = "knowledge_artifacts"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True)  # Figure, Table, Algorithm, Definition, Technique
    title = Column(String, index=True)
    content = Column(Text, nullable=True)
    status = Column(String, default="suggestion")  # suggestion or final
    tags = Column(String, nullable=True)  # Comma-separated tags
    notes = Column(Text, nullable=True)
    knowledge_source_id = Column(Integer, ForeignKey("knowledge_sources.id"))
    external_link = Column(String, nullable=True)
    is_bookmarked = Column(Boolean, default=False)
    chat_history = Column(JSON, nullable=True)

    knowledge_source = relationship("KnowledgeSourceDB", back_populates="artifacts")
