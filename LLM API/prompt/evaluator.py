from .llm_core import call_llm

def evaluate_importance(document_text, topic_or_project):
    system_prompt = """
    You are an academic reviewer evaluating the importance
    of a document for a given topic or project.

    Rules:
    - Base your evaluation STRICTLY on the provided document
    - Do NOT use external knowledge
    - Do NOT speculate about impact beyond what the document supports
    - If the document provides insufficient information,
      state this explicitly

    Use clear, neutral, analytical language.
    """

    user_prompt = f"""
    DOCUMENT:
    \"\"\"
    {document_text}
    \"\"\"

    TOPIC / PROJECT:
    \"\"\"
    {topic_or_project}
    \"\"\"

    Evaluate how important this document is for the given topic/project.

    Consider only:
    - How directly the document addresses the topic/project
    - Whether it provides core concepts, methods, or evidence
    - Whether the contribution is central or peripheral

    Output JSON ONLY in the following format:
    {{
      "relevance_score": 0-100,
      "reason": "Brief justification based only on document content"
    }}

    Scale definition:
    - relevance_score:
      0 = not relevant
      50 = marginally related
      75 = moderately important
      100 = central to the topic/project
    - The relevance_score must be an integer between 0 and 100
    - You may infer relevance if the document provides foundational methods
  commonly used in the given topic/project
    """

    return call_llm(system_prompt, user_prompt)
