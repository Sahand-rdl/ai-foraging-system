import os
import sys
import json
from typing import List, Dict, Any

# --- Path Fix ---
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)  # This is 'LLM API'
if parent_dir not in sys.path:
    sys.path.append(parent_dir)
if current_dir not in sys.path:
    sys.path.append(current_dir)


from config import CHROMA_DB_PATH, PROCESSED_DOCS_DIR


class KnowledgeSearch:
    def __init__(self):
        # Paths from the central config file
        self.json_folder = PROCESSED_DOCS_DIR
        self.db_path = CHROMA_DB_PATH

        # We set this to None to avoid loading the heavy AI model
        # until the user actually selects Semantic Search.
        self.semantic_engine = None

    def _get_semantic_engine(self):
        """Lazy loader for the Semantic Engine to keep the UI fast."""
        if self.semantic_engine is None:
            print("[Status] Initializing AI Model and Vector DB... (One-time load)")
            # Deferred import to prevent startup delay
            from embeddings.documentEmbedder import SemanticSearchEngine

            self.semantic_engine = SemanticSearchEngine(db_path=self.db_path)
        return self.semantic_engine

    def _get_doc_text(self, filename: str) -> str:
        """Helper to extract full text from a Docling JSON file."""
        path = os.path.join(self.json_folder, filename)
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            content_list = data.get("texts", []) or data.get("content", [])
            return " ".join(
                [
                    item.get("text", "")
                    for item in content_list
                    if isinstance(item, dict)
                ]
            )
        except:
            return ""

    def keyword_search(self, query: str) -> List[Dict[str, Any]]:
        """Scans raw text of all JSON documents for the exact query string."""
        results = []
        query_lower = query.lower()

        if not os.path.exists(self.json_folder):
            return []

        files = [f for f in os.listdir(self.json_folder) if f.endswith(".json")]

        for fname in files:
            text = self._get_doc_text(fname)
            if query_lower in text.lower():
                idx = text.lower().find(query_lower)
                start = max(0, idx - 60)
                end = min(len(text), idx + len(query_lower) + 60)
                snippet = f"...{text[start:end]}..."

                results.append(
                    {
                        "filename": fname,
                        "snippet": snippet.replace("\n", " "),
                        "type": "Keyword Match",
                    }
                )
        return results

    def semantic_search(self, query: str) -> List[Dict[str, Any]]:
        """Groups relevant chunks by document via the semantic engine."""
        engine = self._get_semantic_engine()
        raw_results = engine.query(query, top_k=15)

        if (
            not raw_results
            or not raw_results["documents"]
            or len(raw_results["documents"][0]) == 0
        ):
            return []

        unique_docs = {}
        for i in range(len(raw_results["ids"][0])):
            filename = raw_results["metadatas"][0][i].get("filename", "Unknown")
            score = 1 - raw_results["distances"][0][i]
            text = raw_results["documents"][0][i]

            if filename not in unique_docs or score > unique_docs[filename]["score"]:
                unique_docs[filename] = {
                    "filename": filename,
                    "score": score,
                    "snippet": text[:180].replace("\n", " ") + "...",
                    "type": "Semantic Match",
                }

        return sorted(unique_docs.values(), key=lambda x: x["score"], reverse=True)


def exit_check(user_input: str):
    """Utility to handle exit commands at any stage."""
    if user_input.lower() in ["exit", "quit", "q"]:
        print("\nGoodbye!")
        sys.exit(0)


if __name__ == "__main__":
    # 1. IMMEDIATE PRINT: Show menu before any class initialization
    print("\n=== Multi-Mode Knowledge Search ===")
    print("1. Keyword Search (Exact Phrase)")
    print("2. Semantic Search (Concept/Sentence)")
    print("(Type 'exit' at any time to quit)")

    # 2. VALIDATE MODE IMMEDIATELY
    mode = input("\nSelect Mode [1 or 2]: ").strip()
    exit_check(mode)

    if mode not in ["1", "2"]:
        print(
            f"Error: '{mode}' is not a valid choice. Please run the script again and select 1 or 2."
        )
        sys.exit(1)

    # 3. GET QUERY
    query = input("Enter search query: ").strip()
    exit_check(query)

    if not query:
        print("Error: Search query cannot be empty.")
        sys.exit(1)

    # 4. INITIALIZE SEARCHER (Class init is fast, model load is deferred)
    searcher = KnowledgeSearch()
    results = []

    try:
        if mode == "1":
            print(
                f"\n[Status] Scanning local filesystem for exact phrase: '{query}'..."
            )
            results = searcher.keyword_search(query)
        else:
            print(f"\n[Status] Calculating semantic vectors for: '{query}'...")
            results = searcher.semantic_search(query)

        # Output formatting
        if not results:
            print("\nResult: No matches found.")
        else:
            print(f"\nFound {len(results)} relevant documents:\n")
            for i, res in enumerate(results):
                header = f"[{i+1}] {res['filename']}"
                print(header)
                if "score" in res:
                    print(f"    Relevance: {res['score']:.4f}")
                print(f"    Context: {res['snippet']}")
                print("-" * len(header))

    except KeyboardInterrupt:
        print("\nSearch cancelled.")
