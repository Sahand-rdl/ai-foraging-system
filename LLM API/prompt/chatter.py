from .llm_core import call_llm

def chat_about_document(document_text, user_query):
    system_prompt = """
    You are an expert academic assistant answering questions
    STRICTLY based on the provided document.

    Rules:
    - Use ONLY information explicitly stated in the document
    - Do NOT rely on external knowledge
    - Do NOT infer or speculate
    - If the document does not contain sufficient information,
      say so explicitly

    Use clear, concise, technical language.
    """

    user_prompt = f"""
    DOCUMENT:
    \"\"\"
    {document_text}
    \"\"\"

    USER QUESTION:
    {user_query}

    Answer format:
    - Direct answer (if supported by the document)
    - Cite the relevant part of the document implicitly
      (by description, not quotation)
    - If the answer is not found in the document, respond with:
      "The document does not provide sufficient information
       to answer this question."
    """

    return call_llm(system_prompt, user_prompt)