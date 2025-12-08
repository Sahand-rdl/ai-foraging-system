from .llm_core import call_llm

def chat_about_document(document_text, user_query):
    system_prompt = """
    You explain concepts, terminology or details from a document.
    Avoid hallucination and keep explanations clear and simple.
    """

    user_prompt = f"""
    DOCUMENT:
    \"\"\"
    {document_text}
    \"\"\"

    USER QUESTION:
    {user_query}
    """

    return call_llm(system_prompt, user_prompt)