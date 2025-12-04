from .llm_core import call_llm

def extract_entities(document_text):
    """
    Extract structured information such as dates, organizations,
    and key terms from the provided document text.
    The model returns JSON only.
    """
    system_prompt = """
You are a precise extraction assistant.
Extract structured entities and return JSON only.
"""

    user_prompt = f"""
DOCUMENT:
\"\"\"
{document_text}
\"\"\"

Extract:
- dates
- organizations
- key terms
"""

    return call_llm(system_prompt, user_prompt)