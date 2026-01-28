"""Search endpoints."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import httpx
import os
import logging

from database import get_db
from models import KnowledgeSourceDB
from config import settings
from schemas import SearchQuery, SearchResponse

router = APIRouter(prefix="/search", tags=["search"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=SearchResponse)
async def search(query: SearchQuery, db: Session = Depends(get_db)):
    """
    Search documents using the LLM service, then enrich the results
    with local database IDs.
    """
    if not settings.llm_enabled:
        logger.warning(
            "LLM service is disabled in config, but proceeding for search."
        )

    url = f"{settings.llm_service_url}/api/search"
    payload = {"query": query.query, "search_type": query.search_type}

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

                # Strip .json and create a search pattern for the path column
                # e.g., "document_a.json" -> "%/document_a.pdf"
                # This is more robust than just matching the filename.
                base_name = os.path.splitext(filename)[0]
                search_pattern = f"%/{base_name}.pdf" # Assuming PDF, might need to be more generic

                # Find the corresponding KnowledgeSource in the database
                source_db = (
                    db.query(KnowledgeSourceDB)
                    .filter(KnowledgeSourceDB.file_path.like(search_pattern))
                    .first()
                )

                if source_db:
                    enriched_results.append(
                        {
                            "id": source_db.id,
                            "project_id": source_db.project_id,
                            "snippet": result.get("snippet"),
                            "score": result.get("score"),
                            "type": result.get("type"),
                            # Pass through any other fields from llm-service
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
