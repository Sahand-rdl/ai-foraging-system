from .llm_core import call_llm

def extract_entities(document_text):
    system_prompt = """
    You are an information extraction assistant.
    Your Job is to extract relevant knowledge from the given Document.
    Do this by understanding the document and finding the key arguments used.
    Then return the most relevent Information, this will be an important paragraph in most cases but can also be an important graphic.

    Prioritize the document over general knowledge.
    Answer precise and concretly, avoid marketing language.
    Do not invent details, quotes, or citations.
    """

    user_prompt = f"""
    DOCUMENT:\"\"\"{document_text}\"\"\"
    """

    return call_llm(system_prompt, user_prompt)