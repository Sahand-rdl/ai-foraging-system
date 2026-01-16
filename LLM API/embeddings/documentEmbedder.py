import os
import chromadb
from chromadb.utils import embedding_functions
from typing import List, Dict, Any


class SemanticSearchEngine:
    def __init__(self, db_path=None):
        # Set a default path if none provided (pointing to parent dir of the embedding folder)
        if db_path is None:
            db_path = os.path.join(os.path.dirname(__file__), "..", "chroma_db")

        # Ensure the directory exists
        os.makedirs(db_path, exist_ok=True)

        self.client = chromadb.PersistentClient(path=db_path)

        # BGE-Small is excellent for scientific retrieval
        self.embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="BAAI/bge-small-en-v1.5"
        )

        # MUST match across all scripts
        self.collection = self.client.get_or_create_collection(
            name="paper_chunks",
            embedding_function=self.embedding_fn,
            metadata={"hnsw:space": "cosine"},
        )

    def chunk_text(
        self, text: str, chunk_size: int = 1200, overlap: int = 200
    ) -> List[str]:
        chunks = []
        if len(text) <= chunk_size:
            return [text]
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunks.append(text[start:end])
            start += chunk_size - overlap
        return chunks

    def add_document(self, doc_id: str, text_content: str, metadata: Dict[str, Any]):
        chunks = self.chunk_text(text_content)
        ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [metadata for _ in range(len(chunks))]

        self.collection.add(ids=ids, documents=chunks, metadatas=metadatas)
        return len(chunks)

    def query(self, query_text: str, top_k: int = 3):
        return self.collection.query(
            query_texts=[query_text],
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )
