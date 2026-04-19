"""Base HTTP client for microservice communication."""
import httpx
from typing import Any, Dict, Optional
from abc import ABC, abstractmethod


class BaseServiceClient(ABC):
    """Abstract base class for microservice clients."""
    
    def __init__(self, base_url: str, enabled: bool = False, timeout: float = 30.0):
        self.base_url = base_url.rstrip("/")
        self.enabled = enabled
        self.timeout = timeout
    
    @property
    @abstractmethod
    def service_name(self) -> str:
        """Return the name of the service for error messages."""
        pass
    
    def _get_unavailable_response(self, operation: str) -> Dict[str, Any]:
        """Return a standard response when service is unavailable."""
        return {
            "success": False,
            "available": False,
            "service": self.service_name,
            "message": f"{self.service_name} is not available. Enable it in configuration.",
            "operation": operation,
            "data": None
        }
    
    async def _request(
        self,
        method: str,
        endpoint: str,
        json: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make an HTTP request to the service."""
        if not self.enabled:
            return self._get_unavailable_response(endpoint)
        
        url = f"{self.base_url}{endpoint}"
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.request(
                    method=method,
                    url=url,
                    json=json,
                    params=params
                )
                response.raise_for_status()
                return {
                    "success": True,
                    "available": True,
                    "service": self.service_name,
                    "data": response.json()
                }
        except httpx.ConnectError:
            return {
                "success": False,
                "available": False,
                "service": self.service_name,
                "message": f"Cannot connect to {self.service_name} at {self.base_url}",
                "data": None
            }
        except httpx.HTTPStatusError as e:
            return {
                "success": False,
                "available": True,
                "service": self.service_name,
                "message": f"HTTP error: {e.response.status_code}",
                "data": None
            }
        except Exception as e:
            return {
                "success": False,
                "available": True,
                "service": self.service_name,
                "message": f"Error: {str(e)}",
                "data": None
            }