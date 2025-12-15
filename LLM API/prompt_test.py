print("prompt_test.py is running")

import os
import json
from prompt.extractor import extract_entities
from prompt.evaluator import evaluate_relevance
from prompt.chatter import chat_about_document
from prompt.trust_check import trust_checker


DOCLING_FOLDER = "docling_docs"  # Folder containing Markdown files

def load_all_json_docs(folder: str):
    """
    Load all JSON files from the given folder.
    Extract readable text from docling's structured JSON output.
    """
    docs = []

    for fname in os.listdir(folder):
        if not fname.endswith(".json"):
            continue

        path = os.path.join(folder, fname)

        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)

            # ---- Extract meaningful text ----
            text_parts = []

            if isinstance(data, dict):

                # If docling export contains "content"
                if "content" in data and isinstance(data["content"], list):
                    for item in data["content"]:
                        if isinstance(item, dict) and "text" in item:
                            text_parts.append(item["text"])

                # Sometimes text is stored under data["text"]
                elif "text" in data and isinstance(data["text"], str):
                    text_parts.append(data["text"])

            # fallback
            full_text = "\n".join(text_parts).strip()

            if not full_text:
                full_text = f"(No readable text extracted from {fname})"

            docs.append({
                "filename": fname,
                "text": full_text
            })

        except Exception as e:
            print(f"Failed to load {fname}: {e}")

    return docs

def run_tests():
    """
    Run relevance evaluation, entity extraction, and chat tests
    on Markdown documents.
    """
    # Load all Markdown documents
    documents = load_all_json_docs(DOCLING_FOLDER)
    if not documents:
        print(f"No Markdown documents found in {DOCLING_FOLDER}.")
        return

    #adding the ability to choose different models big/small 

    task = input("What do you want to do?\n 1: Check trustworthyness.\n 2:Extract information. \n 3: Evaluate something. \n 4: Chat with the document.")
    

    match task:
        case 1:
            print("trustchecker")
            print(trust_checker(document))
        case 2:
            print("=== Extraction Test ===")
            print(extract_entities(document))
        case 3:
            print("=== Evaluation Test ===")
            query = input("Input your evaluation specifications:\n")
            print(evaluate_relevance(document, query))
        case 4:
            print("=== Chat Test ===")
            query = input("What do you need help with?\n")
            print(chat_about_document(document, query))

    # Evaluate relevance
    relevance_list = []
    for doc in documents:
        score = evaluate_relevance(doc['text'], query)
        relevance_list.append((score, doc))
    # Sort by relevance
    relevance_list.sort(key=lambda x: x[0], reverse=True)
    # Take top 2
    top_docs = relevance_list[:2]
    # Run tests on top documents
    for idx, (score, document) in enumerate(top_docs, 1):
        print(f"\n=== Top {idx}: {document['filename']} (Relevance score: {score}) ===\n")
        
        # Entity extraction test
        print("=== Extraction Test ===")
        print(extract_entities(document['text']))
        print()

        # Chat test
        print("=== Chat Test ===")
        print(chat_about_document(document['text'], query))
        print()

if __name__ == "__main__":
    run_tests()
