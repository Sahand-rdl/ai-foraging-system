"""Centralized configuration for the data service."""
import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables, fallback to defaults."""
    
    # Database
    database_url: str = "sqlite:///./database.db"
    
    # Papers storage - configurable location for PDF and extracted files
    papers_storage_path: str = "~/Documents/AIForaging/papers"
    
    # Microservice URLs
    semantic_search_url: str = "http://localhost:8001"
    llm_service_url: str = "http://localhost:8002"
    
    # Feature flags - disable services that aren't ready yet
    semantic_search_enabled: bool = False
    llm_enabled: bool = False
    
    # Optional API keys for external services
    openai_api_key: Optional[str] = None
    
    # Server settings
    host: str = "127.0.0.1"
    port: int = 8001
    debug: bool = True
    
    @property
    def papers_base_path(self) -> str:
        """Get expanded papers storage path."""
        return os.path.expanduser(self.papers_storage_path)
    
    def get_raw_papers_path(self, project_id: int) -> str:
        """Get path for raw PDF files for a project."""
        return os.path.join(self.papers_base_path, "raw", str(project_id))
    
    def get_extracted_papers_path(self, project_id: int) -> str:
        """Get path for extracted JSON files for a project."""
        return os.path.join(self.papers_base_path, "extracted", str(project_id))
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Global settings instance
settings = Settings()
