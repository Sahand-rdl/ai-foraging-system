"""AI-powered endpoints using external microservices."""
import os
import httpx
import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel

from database import get_db
from models import KnowledgeSourceDB, KnowledgeArtifactDB
from services.llm_service import llm_service_client
from config import settings

router = APIRouter(prefix="/ai", tags=["ai"])
logger = logging.getLogger(__name__)


# --- Request/Response Models ---
class SearchRequest(BaseModel):
    query: str
    search_type: str = "semantic"

class ExtractArtifactsRequest(BaseModel):
    knowledge_source_id: int
    artifact_types: Optional[List[str]] = None

class ChatRequest(BaseModel):
    doc_id: int # The database ID of the knowledge source
    query: str

class SummarizeRequest(BaseModel):

    knowledge_source_id: int

    max_length: Optional[int] = None





# --- Endpoints ---



@router.post("/search")

async def search(request: SearchRequest, db: Session = Depends(get_db)):

    """

    Search documents using the LLM service, then enrich the results

    with local database IDs.

    """

    if not settings.llm_enabled:

        logger.warning(

            "LLM service is disabled in config, but proceeding for search."

        )



    url = f"{settings.llm_service_url}/api/search"

    payload = {"query": request.query, "search_type": request.search_type}



    try:

        async with httpx.AsyncClient(timeout=30.0) as client:

            response = await client.post(url, json=payload)



            if response.status_code != 200:

                logger.error(

                    f"LLM Search failed with status {response.status_code}: {response.text}"

                )

                raise HTTPException(

                    status_code=response.status_code,

                    detail=f"Search service error: {response.text}",

                )



            llm_results = response.json().get("results", [])

            enriched_results = []



            for result in llm_results:

                filename = result.get("filename")

                if not filename:

                    continue

                

                base_name = os.path.splitext(filename)[0]

                search_pattern = f"%/{base_name}.pdf"



                source_db = (

                    db.query(KnowledgeSourceDB)

                    .filter(KnowledgeSourceDB.path.like(search_pattern))

                    .first()

                )



                if source_db and source_db.projects:

                    enriched_results.append(

                        {

                            "id": source_db.id,

                            "project_id": source_db.projects[0].id,

                            **result,

                        }

                    )

            

            return {"results": enriched_results}



    except httpx.RequestError as e:

        logger.error(f"Error connecting to LLM service: {e}")

        raise HTTPException(status_code=503, detail="Search service unavailable")

    except Exception as e:

        logger.error(f"Unexpected search error: {e}", exc_info=True)

        raise HTTPException(

            status_code=500, detail="Internal server error during search"

        )





@router.post("/chat")

async def chat_with_document(request: ChatRequest, db: Session = Depends(get_db)):

    """

    Proxies a chat request to the LLM service for a specific document.

    """


    # 1. Verify the knowledge source exists in our database
    ks = db.query(KnowledgeSourceDB).filter(KnowledgeSourceDB.id == request.doc_id).first()
    if not ks:
        raise HTTPException(status_code=404, detail="Knowledge source not found")

    # 2. Find the corresponding JSON filename for the llm-service
    # The llm-service uses the full JSON filename (e.g., "paper.json") as its doc_id
    base_name = os.path.splitext(os.path.basename(ks.path))[0]
    llm_doc_id = f"{base_name}.json"
    
    # 3. Call the LLM service client with the correct arguments
    result = await llm_service_client.chat(
        doc_id=llm_doc_id,
        query=request.query
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
    llm_health = await llm_service_client.health_check()
    
    return {
        "llm_service": llm_health
    }