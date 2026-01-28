"""
Centralized configuration for the LLM API.
"""
import os

# --- Path Definitions ---

# Base path for all shared papers data, mirroring the data-service config.
PAPERS_STORAGE_PATH = os.path.expanduser("~/Documents/AIForaging/papers")

# Static path to the directory where raw PDFs are stored.
# Note: The pipeline expects a full path to a specific file, but this is useful for scripts.
RAW_DOCS_BASE_DIR = os.path.join(PAPERS_STORAGE_PATH, "raw")

# Static path to the single directory where all processed JSONs will be stored.
PROCESSED_DOCS_DIR = os.path.join(PAPERS_STORAGE_PATH, "extracted")

# Go up two levels to find the root of the llm-service.
LLM_SERVICE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

# Define the single, unified path for the ChromaDB database within the llm-service.
CHROMA_DB_PATH = os.path.join(LLM_SERVICE_ROOT, "chroma_db")

# Ensure the target directory for processed files exists on startup.
os.makedirs(PROCESSED_DOCS_DIR, exist_ok=True)
