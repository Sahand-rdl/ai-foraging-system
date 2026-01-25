"""LLM Service microservice client.

This client interfaces with the LLM API for prompt-based document analysis
and deep-dive interactions. Base URL: http://127.0.0.1:8001
"""
from typing import List, Dict, Any, Optional
from .base import BaseServiceClient
from config import settings


class LLMServiceClient(BaseServiceClient):
    """Client for the LLM microservice.
    
    This service provides LLM-powered capabilities such as:
    - Listing available documents
    - Deep-dive chat queries on documents
    - Trustworthiness analysis with metadata extraction
    - Information/entity extraction from documents
    - Relevance evaluation for specific topics
    """
    
    def __init__(self):
        super().__init__(
            base_url=settings.llm_service_url,
            enabled=settings.llm_enabled
        )
    
    @property
    def service_name(self) -> str:
        return "LLM Service"
    
    # -------------------------------------------------------------------------
    # API Endpoints based on llm_api_docs.md
    # -------------------------------------------------------------------------
    
    async def list_documents(self) -> Dict[str, Any]:
        """List all available document IDs that can be processed.
        
        GET /api/docs
        
        Returns:
            Dict with 'data' containing {"documents": ["paper1.json", ...]}
            or unavailable message if service is disabled/unreachable.
        """
        return await self._request(
            method="GET",
            endpoint="/api/docs"
        )
    
    async def chat(self, doc_id: str, query: str) -> Dict[str, Any]:
        """Perform a deep-dive query on a specific document.
        
        Uses a scientific assistant context to extract and answer questions
        about the specified document.
        
        POST /api/chat
        
        Args:
            doc_id: Document filename (e.g., "paper1.json")
            query: The question or query to ask about the document
        
        Returns:
            Dict with 'data' containing {"reply": "Extracted answer..."}
            or unavailable/error message.
        """
        return await self._request(
            method="POST",
            endpoint="/api/chat",
            json={
                "doc_id": doc_id,
                "query": query
            }
        )
    
    async def check_trust(self, doc_id: str) -> Dict[str, Any]:
        """Analyze document trustworthiness using LLM heuristics.
        
        Extracts metadata and evaluates the document's trustworthiness.
        
        POST /api/trust
        
        Args:
            doc_id: Document filename (e.g., "paper1.json")
        
        Returns:
            Dict with 'data' containing:
            {
                "metadata": {"title": "...", "authors": "...", "source": "..."},
                "trust_result": "Detailed evaluation string..."
            }
            or unavailable/error message.
        """
        return await self._request(
            method="POST",
            endpoint="/api/trust",
            json={"doc_id": doc_id}
        )
    
    async def extract(self, doc_id: str) -> Dict[str, Any]:
        """Extract key entities and sections from a document.
        
        Identifies and extracts important information from the document.
        
        POST /api/extract
        
        Args:
            doc_id: Document filename (e.g., "paper1.json")
        
        Returns:
            Dict with 'data' containing {"entities": ["Finding 1", "Finding 2", ...]}
            or unavailable/error message.
        """
        return await self._request(
            method="POST",
            endpoint="/api/extract",
            json={"doc_id": doc_id}
        )
    
    async def evaluate(self, doc_id: str, topic: str) -> Dict[str, Any]:
        """Evaluate document relevance to a specific topic.
        
        Uses LLM to assess how important and relevant the document content
        is with respect to the given topic.
        
        POST /api/evaluate
        
        Args:
            doc_id: Document filename (e.g., "paper1.json")
            topic: The topic to evaluate relevance against
        
        Returns:
            Dict with 'data' containing {"evaluation": "LLM assessment..."}
            or unavailable/error message.
        """
        return await self._request(
            method="POST",
            endpoint="/api/evaluate",
            json={
                "doc_id": doc_id,
                "topic": topic
            }
        )
    
    async def health_check(self) -> Dict[str, Any]:
        """Check if the LLM service is healthy by listing documents."""
        return await self.list_documents()


# Singleton instance
llm_service_client = LLMServiceClient()
