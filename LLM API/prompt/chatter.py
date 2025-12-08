from .llm_core import call_llm

def chat_about_document(document_text, user_query):
    system_prompt = """
    Prioritize the document over general knowledge.
    Answer precise and concretly.
    If the answer is not clearly supported by the document, say so explicitly.
    When you use the document, cite the relevant excerpt using the format: [doc_name, section/page/line].
    Do not invent details, quotes, or citations.
    If the user’s question is ambiguous with respect to the document, ask a concise clarifying question.
    """

    user_prompt = f"""
    DOCUMENT:\"\"\"{document_text}\"\"\"

    USER QUESTION:{user_query}
    """

    return call_llm(system_prompt, user_prompt)