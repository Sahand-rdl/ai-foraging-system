from .llm_core import call_llm

def extract_entities(document_text):
    system_prompt = """
    You are a precise extraction assistant.
    Extract structured entities and return JSON only.
    """

    user_prompt = f"""
    DOCUMENT:\"\"\"{document_text}\"\"\"
    """

    return call_llm(system_prompt, user_prompt)