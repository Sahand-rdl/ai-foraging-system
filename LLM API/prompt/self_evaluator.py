import json
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
    system_prompt = "You are a critical academic reviewer."

    user_prompt = f"""
    DOCUMENT:
    \"\"\"{document_text}\"\"\"

    EXTRACTION RESULT:
    {extraction_json}

    Review the extraction and provide a structured JSON output with these keys:
    - "weakly_supported": items that are weakly supported (or "*None*")
    - "ambiguous": items that are ambiguous (or "*None*")
    - "missing": important missing items (or "*None*")

    ALWAYS return valid JSON.
    DO NOT include any text outside the JSON.
    Example output:
    {{
    "weakly_supported": "*None*",
    "ambiguous": "*None*",
    "missing": "*None*"
    }}
    """

    response = call_llm(system_prompt, user_prompt)

    if isinstance(response, str):
        try:
            feedback_dict = json.loads(response)
        except json.JSONDecodeError:
            feedback_dict = {
                "weakly_supported": "*None*",
                "ambiguous": "*None*",
                "missing": "*None*",
                "_error": "LLM returned invalid JSON",
                "_raw": response
            }
    elif isinstance(response, dict):
        feedback_dict = response
    else:
        feedback_dict = {
            "weakly_supported": "*None*",
            "ambiguous": "*None*",
            "missing": "*None*",
            "_error": "LLM returned unknown type",
            "_raw": str(response)
        }

    return feedback_dict