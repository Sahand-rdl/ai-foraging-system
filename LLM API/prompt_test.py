import os
import json
import sys

# Ensure the script can find modules in the current directory and subdirectories
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from prompt.extractor import extract_entities
from prompt.evaluator import evaluate_importance
from embeddings.chatter import ScientificAssistant
from prompt.trust_checker import trust_checker, extract_key_sections, extract_full_text
from prompt.doc_parser import extract_metadata_heuristics

# New Import for TF-IDF logic
from tfidf import analyze_document_tfidf

DOCLING_FOLDER = "docling_docs"


def load_all_json_docs(folder: str):
    docs = []
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
    documents = load_all_json_docs(DOCLING_FOLDER)
    if not documents:
        print(f"No JSON documents found in {DOCLING_FOLDER}.")
        return

    print("\n=== Available Documents ===")
    for idx, doc in enumerate(documents):
        print(f"{idx}: {doc['filename']}")

    try:
        selection = input("\nSelect document ID (or type 'exit'): ")
        if selection.lower() in ["exit", "quit"]:
            return

        doc_idx = int(selection)
        selected_doc = documents[doc_idx]
        doc_data = selected_doc["data"]
        filename = selected_doc["filename"]
    except (ValueError, IndexError):
        print("Invalid selection.")
        return

    print("\nTasks:")
    print("1: Check Trustworthiness")
    print("2: Extract Information (Entities)")
    print("3: Evaluate Relevance")
    print("4: Chat with Document")
    print("5: Extract Key Terms (TF-IDF)")

    task = input("\nSelect task ID (or type 'exit'): ")
    if task.lower() in ["exit", "quit"]:
        return

    if task == "1":
        print("\n=== Trust Checker ===")
        trust_text = extract_key_sections(doc_data)
        metadata = extract_metadata_heuristics(doc_data)
        print("Metadata:", json.dumps(metadata, indent=2))
        print("Result:", trust_checker(trust_text))

    elif task == "2":
        print("\n=== Extraction ===")
        full_text = extract_full_text(doc_data)
        print(extract_entities(full_text))

    elif task == "3":
        print("\n=== Evaluation ===")
        topic = input("Enter Topic/Project description: ")
        full_text = extract_full_text(doc_data)
        print(evaluate_importance(full_text, topic))

    elif task == "4":
        print("\n=== Chat ===")
        query = input("Ask a question: ")
        assistant = ScientificAssistant()
        assistant.set_active_document(filename)
        print(f"\nA: {assistant.ask(query)}\n")

    elif task == "5":
        print(f"\n=== TF-IDF Keyword Analysis for {filename} ===")
        print("Analyzing document in context of repository...")
        keywords = analyze_document_tfidf(filename, DOCLING_FOLDER, top_n=10)

        if not keywords:
            print("Could not extract keywords.")
        else:
            print("\nTop 10 Distinctive Keywords:")
            print("-" * 30)
            for i, (word, score) in enumerate(keywords):
                print(f"{i+1}. {word:<20} (Score: {score:.4f})")


if __name__ == "__main__":
    run_tests()
