from .llm_core import call_llm
import json


def evaluate_importance(document_text, project_definition):
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

    TOPIC / PROJECT DEFINITION:
    \"\"\"
    {project_definition}
    \"\"\"

    Evaluate how important this document is for the given topic/project.

    Consider only:
    - How directly the document addresses the topic/project
    - Whether it provides core concepts, methods, or evidence
    - Whether the contribution is central or peripheral

    Output JSON ONLY in the following format:
    {{
      "relevance_score": 0-100,
    }}
    Scale definition:
    - relevance_score:
      0 = not relevant
      30 = marginally related
      65 = moderately important
      100 = central to the topic/project
    Note: The scale is continuous; provide precise scores.

    The relevance_score should reflect the document's direct
    contribution to the topic/project based solely on its content.
    """

    raw = call_llm(system_prompt, user_prompt)
    return json.loads(raw)
