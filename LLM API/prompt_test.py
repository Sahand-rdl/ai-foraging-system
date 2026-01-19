print("prompt_test.py is running")

import os
import json
from prompt.extractor import extract_entities
from prompt.evaluator import evaluate_importance
from prompt.trust_checker import trust_checker, extract_key_sections
from prompt.doc_parser import extract_metadata_heuristics

DOCLING_FOLDER = "docling_docs"


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
            docs.append({"filename": fname, "data": data})
        except Exception as e:
            print(f"Failed to load {fname}: {e}")

    return docs


def run_tests():
    # 1. Load Documents
    documents = load_all_json_docs(DOCLING_FOLDER)
    if not documents:
        print(f"No JSON documents found in {DOCLING_FOLDER}.")
        print("Please run docling_doc.py first to convert PDFs.")
        return

    # 2. Select Document
    print("\nAvailable Documents:")
    for idx, doc in enumerate(documents):
        print(f"{idx}: {doc['filename']}")

    try:
        selection = input("\nSelect document ID: ")
        doc_idx = int(selection)
        selected_doc = documents[doc_idx]
        doc_data = selected_doc["data"]
    except (ValueError, IndexError):
        print("Invalid selection.")
        return

    # 3. Select Task
    print("\nTasks:")
    print("1: Check Trustworthiness")
    print("2: Extract Information (Entities)")
    print("3: Evaluate Relevance")

    task = input("\nSelect task ID: ")

    # 4. Execute Task
    if task == "1":
        print("\n=== Trust Checker ===")
        # Use specific text extraction for trust check
        trust_text = extract_key_sections(doc_data)
        metadata = extract_metadata_heuristics(doc_data)
        print("Metadata:", json.dumps(metadata, indent=2))

        if not trust_text.strip():
            print(
                "WARNING: No text could be extracted from this document. Trust checker may fail."
            )
        else:
            print(f"Extracted {len(trust_text)} chars for analysis.")
            print("Result:", trust_checker(trust_text))

    elif task == "2":
        print("\n=== Extraction ===")
        # Prepare full text for extraction
        full_text = extract_key_sections(doc_data)
        print(extract_entities(full_text))

    elif task == "3":
        print("\n=== Evaluation ===")
        topic = input("Enter Topic/Project description: ")
        full_text = extract_key_sections(doc_data)
        print(evaluate_importance(full_text, topic))


if __name__ == "__main__":
    run_tests()
