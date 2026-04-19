"""Routes package for the data service API."""
from fastapi import APIRouter

from .researchers import router as researchers_router
from .projects import router as projects_router
from .knowledge_sources import router as knowledge_sources_router
from .knowledge_artifacts import router as knowledge_artifacts_router
from .ai import router as ai_router
from .search import router as search_router

__all__ = [
    "researchers_router",
    "projects_router", 
    "knowledge_sources_router",
    "knowledge_artifacts_router",
    "ai_router",
    "search_router",
]