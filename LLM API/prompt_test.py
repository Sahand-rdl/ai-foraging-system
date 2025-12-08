print("prompt_test.py is running")

import os
from prompt.extractor import extract_entities
from prompt.evaluator import evaluate_relevance
from prompt.chatter import chat_about_document
from prompt.trust_check import trust_checker


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
