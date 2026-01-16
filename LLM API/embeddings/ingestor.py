import os
import sys
import json

# Ensure sibling imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from documentEmbedder import SemanticSearchEngine

# Using the relative paths you preferred
JSON_FOLDER = os.path.join("..", "docling_docs")
DB_PATH = os.path.join("..", "chroma_db")

engine = SemanticSearchEngine(db_path=DB_PATH)


def run_ingestion():
    if not os.path.exists(JSON_FOLDER):
        print(f"Error: Folder {JSON_FOLDER} not found.")
        return

    files = [f for f in os.listdir(JSON_FOLDER) if f.endswith(".json")]
    print(f"Found {len(files)} files in directory.")

    # 1. Get a list of what's already in the database to show a summary
    # Note: We check by 'filename' metadata which we save during add_document
    total_in_db = engine.collection.count()
    print(f"Current database contains {total_in_db} chunks.")

    new_files_count = 0

    for fname in files:
        # 2. CHECK FOR REDUNDANCY
        # We query the collection to see if this specific filename has any entries
        existing = engine.collection.get(
            where={"filename": fname},
            limit=1,  # We only need to find one chunk to know the file is there
        )

        if existing and existing.get("ids"):
            # print(f"Skipping {fname}: Already indexed.")
            continue

        # 3. PROCESS NEW FILE
        path = os.path.join(JSON_FOLDER, fname)
        try:
            with open(path, "r", encoding="utf-8") as f:
                doc_data = json.load(f)

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

            print(f"Indexing NEW file: {doc_id}...")
            num_chunks = engine.add_document(doc_id, full_text, metadata)
            print(f"Finished {doc_id}: Added {num_chunks} chunks.")
            new_files_count += 1

        except Exception as e:
            print(f"Error processing {fname}: {e}")

    if new_files_count == 0:
        print("No new documents found. Database is up to date.")
    else:
        print(f"Ingestion complete. Added {new_files_count} new documents.")


if __name__ == "__main__":
    run_ingestion()
