from .llm_core import call_llm

def evaluate_relevance(document_text, user_query):
    system_prompt = """
    You evaluate how well a document answers the user query.
    Return JSON with:
    - relevance_score (0-5)
    - trustworthiness (0-5)
    - reason
    """

    user_prompt = f"""
    DOCUMENT:\"\"\"{document_text}\"\"\"

    QUERY:\"\"\"{user_query}\"\"\"

    Expected JSON format:
    {{
    "relevance_score": 0-5,
    "trustworthiness": 0-5,
    "reason": "..."
    }}
    """

    return call_llm(system_prompt, user_prompt)