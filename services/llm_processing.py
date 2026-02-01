import httpx
from typing import Dict, Any, Optional
import logging
from config import settings
from models import KnowledgeSourceDB, KnowledgeArtifactDB
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified


logger = logging.getLogger(__name__)

async def process_document(project_definition: str, file_path: str) -> Optional[Dict[str, Any]]:
    """
    Call the LLM service to process a document.
    
    Args:
        project_definition: The definition of the project.
        file_path: The absolute path to the PDF file.
        
    Returns:
        Dict containing extracted metadata, artifacts, etc., or None if processing failed.
    """
    if not settings.llm_enabled:
        logger.warning("LLM service is disabled via config.")
        return None

    url = f"{settings.llm_service_url}/api/process_document"
    
    payload = {
        "project_definition": project_definition,
        "path": file_path
    }
    
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:  # Long timeout for processing
            response = await client.post(url, json=payload)
            response.raise_for_status()
            processing_data = response.json()
            logger.info(f"LLM service /api/process_document JSON response: {processing_data}")
            return processing_data
            
    except httpx.RequestError as e:
        logger.error(f"An error occurred while requesting {e.request.url!r}: {e}")
    except httpx.HTTPStatusError as e:
        logger.error(f"Error response {e.response.status_code} while requesting {e.request.url!r}: {e.response.text}")
    except Exception as e:
        logger.error(f"Unexpected error during document processing: {e}")
        
    return None


def update_source_with_processing_results(db: Session, ks: KnowledgeSourceDB, processing_result: Dict[str, Any]):
    """
    Updates a KnowledgeSourceDB object with results from the LLM processing pipeline
    and creates KnowledgeArtifactDB entries.
    """
    # Update metadata
    if "metadata" in processing_result:
        current_metadata = dict(ks.source_metadata) if ks.source_metadata else {}
        current_metadata.update(processing_result["metadata"])
        if "relevance" in processing_result:
            current_metadata["relevance"] = processing_result["relevance"]
        ks.source_metadata = current_metadata
        flag_modified(ks, "source_metadata") # Needed for SQLAlchemy to detect JSON changes
        
    # Update tags
    if "tags" in processing_result and processing_result["tags"]:
        ks.tags = ",".join(processing_result["tags"])
        
    # Update trustworthiness
    if "trust_result" in processing_result:
        trust_result = processing_result["trust_result"]
        if isinstance(trust_result, dict):
            # Assuming trustworthiness_score is 1, 2, or 3
            ks.trustworthiness = trust_result.get("trustworthiness_score") 
            ks.trustworthiness_reason = trust_result.get("reason")
    
    # Commit changes to DB first before adding artifacts
    db.add(ks)
    db.commit()
    db.refresh(ks) # Refresh to ensure ks.id is available and relationships are fresh

    # Process and store KnowledgeArtifacts
    if "knowledge_artifacts" in processing_result and isinstance(processing_result["knowledge_artifacts"], dict):
        
        knowledge_artifacts_data = processing_result["knowledge_artifacts"]

        # Terminologies
        for term_data in knowledge_artifacts_data.get("terminologies", []):
            db_artifact = KnowledgeArtifactDB(
                knowledge_source_id=ks.id,
                type="terminology",
                title=term_data.get("term", "Untitled Terminology"),
                content=term_data.get("meaning"),
                status="suggestion",
            )
            db.add(db_artifact)

        # Figures
        for figure_data in knowledge_artifacts_data.get("figures", []):
            db_artifact = KnowledgeArtifactDB(
                knowledge_source_id=ks.id,
                type="figure",
                title=figure_data.get("figure", "Untitled Figure"),
                content=figure_data.get("description"),
                status="suggestion",
            )
            db.add(db_artifact)

        # Tables
        for table_data in knowledge_artifacts_data.get("tables", []):
            db_artifact = KnowledgeArtifactDB(
                knowledge_source_id=ks.id,
                type="table",
                title=table_data.get("table", "Untitled Table"),
                content=table_data.get("description"), # Assuming tables also have a description
                status="suggestion",
            )
            db.add(db_artifact)

        # Algorithms
        for algo_data in knowledge_artifacts_data.get("algorithms", []):
            title = algo_data.get("algorithm", "Untitled Algorithm")
            content = f"Goal: {algo_data.get('goal', 'N/A')}\nProcess: {algo_data.get('process', 'N/A')}"
            db_artifact = KnowledgeArtifactDB(
                knowledge_source_id=ks.id,
                type="algorithm",
                title=title,
                content=content,
                status="suggestion",
            )
            db.add(db_artifact)
        
        db.commit()