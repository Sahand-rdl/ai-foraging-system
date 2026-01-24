import os
import json
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from embeddings.chatter import ScientificAssistant
from main_pipeline import run_automatic_pipeline


# ===== Path setup =====
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCLING_FOLDER = os.path.join(BASE_DIR, "docling_docs")


# ===== FastAPI initialization =====
app = FastAPI(
    title="LLM API",
    description="API wrapper for prompt-based document analysis",
    version="1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== Initialize Scientific Assistant (shared instance) =====
assistant = ScientificAssistant()


# ===== Utility functions =====
def load_all_json_docs(folder: str):
    docs = []

    if not os.path.exists(folder):
        return docs

    for fname in os.listdir(folder):
        if not fname.endswith(".json"):
            continue

        path = os.path.join(folder, fname)
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            docs.append({
                "id": fname,
                "data": data
            })
        except Exception as e:
            print(f"Failed to load {fname}: {e}")

    return docs


def get_document_by_id(doc_id: str):
    docs = load_all_json_docs(DOCLING_FOLDER)
    for doc in docs:
        if doc["id"] == doc_id:
            return doc
    return None


# ===== Request models =====
class ChatRequest(BaseModel):
    doc_id: str
    query: str

class ProcessRequest(BaseModel):
    path: str
    project_definition: str


# ===== API endpoints =====

@app.get("/api/docs")
def list_documents():
    """
    List all available document IDs.
    """
    return {
        "documents": assistant.list_documents()
    }


@app.post("/api/chat")
def chat_with_document(req: ChatRequest):
    """
    Task 4: Chat with Document (deep-dive using ScientificAssistant)
    """
    docs = assistant.list_documents()
    if req.doc_id not in docs:
        raise HTTPException(status_code=404, detail="Document not found")

    assistant.set_active_document(req.doc_id)
    reply = assistant.ask(req.query)

    return {
        "reply": reply
    }

@app.post("/api/process_document")
def process_document(req: ProcessRequest):
    """
    Runs the full automatic processing pipeline for a single document.
    """
    try:
        result = run_automatic_pipeline(req.path, req.project_definition)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
