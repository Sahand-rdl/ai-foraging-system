import httpx
from typing import Dict, Any, Optional
import logging
from config import settings

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
            return response.json()
            
    except httpx.RequestError as e:
        logger.error(f"An error occurred while requesting {e.request.url!r}: {e}")
    except httpx.HTTPStatusError as e:
        logger.error(f"Error response {e.response.status_code} while requesting {e.request.url!r}: {e.response.text}")
    except Exception as e:
        logger.error(f"Unexpected error during document processing: {e}")
        
    return None
