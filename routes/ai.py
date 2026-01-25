"""AI-powered endpoints using external microservices."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel

from database import get_db
from models import KnowledgeSourceDB, KnowledgeArtifactDB
from services.semantic_search import semantic_search_client
from services.llm_service import llm_service_client

router = APIRouter(prefix="/ai", tags=["ai"])


# --- Request/Response Models ---
class SearchRequest(BaseModel):
    query: str
    limit: int = 10
    project_id: Optional[int] = None


class ExtractArtifactsRequest(BaseModel):
    knowledge_source_id: int
    artifact_types: Optional[List[str]] = None


class ChatRequest(BaseModel):
    message: str
    knowledge_source_id: Optional[int] = None
    chat_history: Optional[List[dict]] = None


class SummarizeRequest(BaseModel):
    knowledge_source_id: int
    max_length: Optional[int] = None


# --- Endpoints ---
@router.post("/search")
async def semantic_search(request: SearchRequest):
    """Search knowledge sources using semantic similarity."""
    filters = {}
    if request.project_id:
        filters["project_id"] = request.project_id
    
    result = await semantic_search_client.search(
        query=request.query,
        limit=request.limit,
        filters=filters
    )
    return result


@router.post("/extract-artifacts")
async def extract_artifacts(request: ExtractArtifactsRequest, db: Session = Depends(get_db)):
    """Extract knowledge artifacts from a knowledge source using LLM."""
    # Get the knowledge source
    ks = db.query(KnowledgeSourceDB).filter(KnowledgeSourceDB.id == request.knowledge_source_id).first()
    if not ks:
        raise HTTPException(status_code=404, detail="Knowledge source not found")
    
    if not ks.raw_text:
        raise HTTPException(status_code=400, detail="Knowledge source has no raw text to analyze")
    
    result = await llm_service_client.extract_artifacts(
        document_id=ks.id,
        content=ks.raw_text,
        artifact_types=request.artifact_types
    )
    return result


@router.post("/chat")
async def chat_with_context(request: ChatRequest, db: Session = Depends(get_db)):
    """Chat with LLM, optionally with context from a knowledge source."""
    context = None
    
    if request.knowledge_source_id:
        ks = db.query(KnowledgeSourceDB).filter(KnowledgeSourceDB.id == request.knowledge_source_id).first()
        if ks and ks.raw_text:
            context = ks.raw_text[:4000]  # Limit context length
    
    result = await llm_service_client.chat(
        message=request.message,
        context=context,
        chat_history=request.chat_history
    )
    return result


@router.post("/summarize")
async def summarize_source(request: SummarizeRequest, db: Session = Depends(get_db)):
    """Generate a summary of a knowledge source."""
    ks = db.query(KnowledgeSourceDB).filter(KnowledgeSourceDB.id == request.knowledge_source_id).first()
    if not ks:
        raise HTTPException(status_code=404, detail="Knowledge source not found")
    
    if not ks.raw_text:
        raise HTTPException(status_code=400, detail="Knowledge source has no raw text to summarize")
    
    result = await llm_service_client.summarize(
        content=ks.raw_text,
        max_length=request.max_length
    )
    return result


@router.get("/health")
async def check_services_health():
    """Check the health of all AI microservices."""
    search_health = await semantic_search_client.health_check()
    llm_health = await llm_service_client.health_check()
    
    return {
        "semantic_search": search_health,
        "llm_service": llm_health
    }
