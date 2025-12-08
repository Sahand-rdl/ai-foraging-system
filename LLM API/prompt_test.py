print("prompt_test.py is running")

import os
from prompt.extractor import extract_entities
from prompt.evaluator import evaluate_relevance
from prompt.chatter import chat_about_document

DOCLING_FOLDER = "docling_docs"  # Folder containing Markdown files

def load_all_markdown_docs(folder: str):
    """
    Load all Markdown files from the given folder.
    Each document is stored as a dictionary with 'filename' and 'text'.
    """
    docs = []
    for fname in os.listdir(folder):
        if fname.endswith(".md"):
            path = os.path.join(folder, fname)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                docs.append({
                    "filename": fname,
                    "text": content
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
    documents = load_all_markdown_docs(DOCLING_FOLDER)
    if not documents:
        print(f"No Markdown documents found in {DOCLING_FOLDER}.")
        return

    # Ask the user for a query
    query = input("Your question: ")

    # Evaluate relevance for each document
    relevance_list = []
    for doc in documents:
        score = evaluate_relevance(doc['text'], query)  # Use text directly
        relevance_list.append((score, doc))

    # Sort documents by relevance score in descending order
    relevance_list.sort(key=lambda x: x[0], reverse=True)

    # Take top 2 most relevant documents
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
