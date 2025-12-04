print("prompt_test.py is running")

from prompt.extractor import extract_entities
from prompt.evaluator import evaluate_relevance
from prompt.chatter import chat_about_document

import PyPDF2

def read_pdf_text(pdf_path):
    """Extract text from PDF files"""
    text = ""
    with open(pdf_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text

def run_tests():
    pdf_path = "example.pdf" 
    document = read_pdf_text(pdf_path)

    query = input("your question: ")

    print("=== Extraction Test ===")
    print(extract_entities(document))
    print()

    print("=== Evaluation Test ===")
    print(evaluate_relevance(document, query))
    print()

    print("=== Chat Test ===")
    print(chat_about_document(document, query))
    print()


if __name__ == "__main__":
    run_tests()