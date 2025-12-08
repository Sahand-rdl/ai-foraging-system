print("prompt_test.py is running")

from prompt.extractor import extract_entities
from prompt.evaluator import evaluate_relevance
from prompt.chatter import chat_about_document
from prompt.trust_check import trust_checker


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



if __name__ == "__main__":
    run_tests()