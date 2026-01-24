import os
import json
import sys

# Ensure the script can find modules in the current directory and subdirectories
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from prompt.extractor import extract_entities
from prompt.evaluator import evaluate_importance

# Corrected import: chatter is in the embeddings directory
from embeddings.chatter import ScientificAssistant
from prompt.trust_checker import trust_checker, extract_key_sections, extract_full_text
from prompt.doc_parser import extract_metadata_heuristics

DOCLING_FOLDER = "docling_docs"


def load_all_json_docs(folder: str):
    docs = []
    # Resolve folder relative to this script
    base_path = os.path.dirname(os.path.abspath(__file__))
    target_folder = os.path.join(base_path, folder)

    if not os.path.exists(target_folder):
        return docs

    for fname in os.listdir(target_folder):
        if not fname.endswith(".json"):
            continue

        path = os.path.join(target_folder, fname)
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
        selection = input("\nSelect document ID (or type 'exit'): ")
        if selection.lower() in ["exit", "quit"]:
            return

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
    print("4: Chat with Document")

    task = input("\nSelect task ID (or type 'exit'): ")
    if task.lower() in ["exit", "quit"]:
        return

    # 4. Execute Task
    if task == "1":
        print("\n=== Trust Checker ===")
        # Trust check uses focused sections to evaluate context/venue
        trust_text = extract_key_sections(doc_data)
        metadata = extract_metadata_heuristics(doc_data)
        print("Metadata:", json.dumps(metadata, indent=2))

        if not trust_text.strip():
            print("WARNING: No text could be extracted from this document.")
        else:
            print("Result:", trust_checker(trust_text))

    elif task == "2":
        print("\n=== Extraction ===")
        # Use full text for information extraction as requested
        full_text = extract_full_text(doc_data)
        print(extract_entities(full_text))

    elif task == "3":
        print("\n=== Evaluation ===")
        topic = input("Enter Topic/Project description: ")
        # Use full text for relevance evaluation as requested
        full_text = extract_full_text(doc_data)
        print(evaluate_importance(full_text, topic))

    elif task == "4":
        print("\n=== Chat ===")
        query = input("Ask a question: ")
        # Using the ScientificAssistant from embeddings/chatter.py
        # This class handles full text loading internally via Deep-Dive mode
        assistant = ScientificAssistant()
        assistant.set_active_document(selected_doc["filename"])
        print(f"Analyzing {selected_doc['filename']}...")
        print(f"\nA: {assistant.ask(query)}\n")


if __name__ == "__main__":
    run_tests()
