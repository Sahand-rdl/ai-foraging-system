"""Semantic Search microservice client."""
from typing import List, Dict, Any, Optional
from .base import BaseServiceClient
from config import settings


class SemanticSearchClient(BaseServiceClient):
    
    def __init__(self):
        super().__init__(
            base_url=settings.semantic_search_url,
            enabled=settings.semantic_search_enabled
        )
    
    @property
    def service_name(self) -> str:
        return "Semantic Search"
    
    async def search(
        self,
        query: str,
        limit: int = 10,
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Search for relevant documents using semantic similarity.
        
        Args:
            query: Natural language search query
            limit: Maximum number of results to return
            filters: Optional filters (e.g., project_id, source_type)
        
        Returns:
            Dict with search results or unavailable message
        """
        return await self._request(
            method="POST",
            endpoint="/search",
            json={
                "query": query,
                "limit": limit,
                "filters": filters or {}
            }
        )
    
    async def index_document(
        self,
        document_id: int,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Index a document for semantic search.
        
        Args:
            document_id: ID of the knowledge source or artifact
            content: Text content to index
            metadata: Additional metadata for filtering
        
        Returns:
            Dict with indexing status
        """
        return await self._request(
            method="POST",
            endpoint="/index",
            json={
                "document_id": document_id,
                "content": content,
                "metadata": metadata or {}
            }
        )
    
    async def delete_document(self, document_id: int) -> Dict[str, Any]:
        """Remove a document from the search index.
        
        Args:
            document_id: ID of the document to remove
        
        Returns:
            Dict with deletion status
        """
        return await self._request(
            method="DELETE",
            endpoint=f"/documents/{document_id}"
        )
    
    async def health_check(self) -> Dict[str, Any]:
        """Check if the semantic search service is healthy."""
        return await self._request(method="GET", endpoint="/health")


# Singleton instance
semantic_search_client = SemanticSearchClient()