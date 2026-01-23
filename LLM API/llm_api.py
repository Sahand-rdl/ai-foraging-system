import os
import json
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from prompt.extractor import extract_entities
from prompt.evaluator import evaluate_importance
from prompt.trust_checker import trust_checker, extract_key_sections
from prompt.doc_parser import extract_metadata_heuristics

from embeddings.chatter import ScientificAssistant


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


class TrustRequest(BaseModel):
    doc_id: str


class ExtractRequest(BaseModel):
    doc_id: str


class EvaluateRequest(BaseModel):
    doc_id: str
    topic: str


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


@app.post("/api/trust")
def check_trustworthiness(req: TrustRequest):
    """
    Task 1: Check Trustworthiness
    """
    doc = get_document_by_id(req.doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")

    text = extract_key_sections(doc["data"])
    metadata = extract_metadata_heuristics(doc["data"])
    result = trust_checker(text)

    return {
        "metadata": metadata,
        "trust_result": result
    }


# input: path
# output: 


@app.post("/api/extract")
def extract_information(req: ExtractRequest):
    """
    Task 2: Extract Information
    """
    doc = get_document_by_id(req.doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")

    text = extract_key_sections(doc["data"])
    entities = extract_entities(text)

    return {
        "entities": entities
    }


@app.post("/api/evaluate")
def evaluate_relevance(req: EvaluateRequest):
    """
    Task 3: Evaluate Relevance
    """
    doc = get_document_by_id(req.doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")

    text = extract_key_sections(doc["data"])
    evaluation = evaluate_importance(text, req.topic)

    return {
        "evaluation": evaluation
    }
