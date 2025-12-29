from .llm_core import call_llm
from .schema import REQUIRED_KEYS

def check_completeness(extraction_json):       
    for key in REQUIRED_KEYS:
        if key not in extraction_json:
            return False
        if not isinstance(extraction_json[key], list):
            return False
    return True


def self_assess(document_text, extraction_json):
    system_prompt = """
    You are a critical academic reviewer.
    """

    user_prompt = f"""
    DOCUMENT:
    \"\"\"
    {document_text}
    \"\"\"

    EXTRACTION RESULT:
    {extraction_json}

    Review the extraction and identify:
    - Weakly supported items
    - Ambiguous items
    - Important missing items

    Do NOT add new items.
    Provide brief explanations.
    """

    return call_llm(system_prompt, user_prompt)