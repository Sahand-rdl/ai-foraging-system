import os
import json
from documentEmbedder import SemanticSearchEngine

# Config: Unified path
DB_PATH = os.path.join("..", "chroma_db")
JSON_FOLDER = os.path.join("..", "docling_docs")

engine = SemanticSearchEngine(db_path=DB_PATH)


def run_ingestion():
    if not os.path.exists(JSON_FOLDER):
        print(f"Error: Folder {JSON_FOLDER} not found.")
        return

    files = [f for f in os.listdir(JSON_FOLDER) if f.endswith(".json")]
    print(f"Found {len(files)} documents to index...")

    for fname in files:
        path = os.path.join(JSON_FOLDER, fname)
        try:
            with open(path, "r", encoding="utf-8") as f:
                doc_data = json.load(f)

            # Support both 'texts' and 'content' keys
            content_list = doc_data.get("texts", []) or doc_data.get("content", [])
            full_text = " ".join(
                [
                    item.get("text", "")
                    for item in content_list
                    if isinstance(item, dict)
                ]
            )

            if not full_text.strip():
                continue

            doc_id = fname.replace(".json", "")
            metadata = {"filename": fname}

            print(f"Indexing {doc_id}...")
            num_chunks = engine.add_document(doc_id, full_text, metadata)
            print(f"Finished {doc_id}: Added {num_chunks} chunks.")

        except Exception as e:
            print(f"Error processing {fname}: {e}")


if __name__ == "__main__":
    run_ingestion()
