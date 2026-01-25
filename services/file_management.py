import os
import shutil
import aiofiles
import httpx
from fastapi import UploadFile
from typing import Optional
from config import settings

def ensure_directory(path: str):
    """Ensure that a directory exists."""
    os.makedirs(path, exist_ok=True)

async def save_upload_file(file: UploadFile, destination: str) -> str:
    """
    Save an uploaded file to the destination.
    """
    ensure_directory(os.path.dirname(destination))
    
    async with aiofiles.open(destination, 'wb') as out_file:
        while content := await file.read(1024 * 1024):  # Read in chunks
            await out_file.write(content)
            
    return destination

async def download_file(url: str, destination: str) -> Optional[str]:
    """
    Download a file from a URL to the destination.
    """
    ensure_directory(os.path.dirname(destination))
    
    try:
        async with httpx.AsyncClient() as client:
            async with client.stream('GET', url) as response:
                response.raise_for_status()
                async with aiofiles.open(destination, 'wb') as out_file:
                    async for chunk in response.aiter_bytes():
                        await out_file.write(chunk)
        return destination
    except Exception as e:
        # minimal logging here, could be improved
        print(f"Failed to download file: {e}") 
        return None
