import os
import sys
import json
import traceback

# Ensure sibling imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from documentEmbedder import SemanticSearchEngine

# Using the relative paths
JSON_FOLDER = os.path.join(os.path.dirname(__file__), "docling_docs")
DB_PATH = os.path.join("..", "chroma_db")

# Ensure folders exist
os.makedirs(JSON_FOLDER, exist_ok=True)
os.makedirs(DB_PATH, exist_ok=True)

engine = SemanticSearchEngine(db_path=DB_PATH)


def run_ingestion():
    files = [f for f in os.listdir(JSON_FOLDER) if f.endswith(".json")]
    print(f"Found {len(files)} files in directory.")

    total_in_db = engine.collection.count()
    print(f"Current database contains {total_in_db} chunks.")

    new_files_count = 0

    for fname in files:
        try:
            # Check if already indexed
            existing = engine.collection.get(where={"filename": fname}, limit=1)
            if existing and existing.get("ids"):
                continue

            path = os.path.join(JSON_FOLDER, fname)
            with open(path, "r", encoding="utf-8") as f:
                doc_data = json.load(f)

            content_list = doc_data.get("texts", []) or doc_data.get("content", [])
            if not isinstance(content_list, list):
                content_list = []

            full_text = " ".join(
                [item.get("text", "") for item in content_list if isinstance(item, dict)]
            )

            if not full_text.strip():
                continue

            doc_id = fname.replace(".json", "")
            metadata = {"filename": fname}

            print(f"Indexing NEW file: {doc_id}...")
            num_chunks = engine.add_document(doc_id, full_text, metadata)
            print(f"Finished {doc_id}: Added {num_chunks} chunks.")
            new_files_count += 1

        except Exception as e:
            print(f"Error processing {fname}: {e}")
            traceback.print_exc()

    if new_files_count == 0:
        print("No new documents found. Database is up to date.")
    else:
        print(f"Ingestion complete. Added {new_files_count} new documents.")


if __name__ == "__main__":
    run_ingestion()