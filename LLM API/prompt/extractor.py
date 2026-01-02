from .llm_core import call_llm
import json


def extract_entities(document_text, prompt_version="v1"):
    """
    Extract structured entities from a scientific document.

    This function is intentionally designed to:
    - Always return the SAME JSON schema
    - Support iterative refinement via prompt_version
    - Never change output structure across iterations
    """

    # -------------------------
    # Strategy control by mode
    # -------------------------
    if prompt_version == "v1":
        mode_instruction = """
        MODE: BASELINE EXTRACTION
        - Extract only explicitly stated items
        - Be conservative
        - Do not attempt to resolve ambiguity
        """
    elif prompt_version == "v_refined_disambiguation":
        mode_instruction = """
        MODE: DISAMBIGUATION
        - Remove items that are weakly supported or ambiguous
        - Prefer exact mentions over paraphrases
        - If uncertain, EXCLUDE the item
        """
    elif prompt_version == "v_refined_coverage":
        mode_instruction = """
        MODE: COVERAGE
        - Add clearly stated items that may have been missed
        - Still obey all schema and strictness rules
        """
    else:
        mode_instruction = "MODE: DEFAULT"

    # -------------------------
    # System prompt (hard rules)
    # -------------------------
    system_prompt = f"""
    You are an information extraction FUNCTION, not a writer.

    Your job is to extract structured information from a scientific document.

    CRITICAL RULES:
    - ALWAYS output valid JSON
    - ALWAYS follow the EXACT schema provided
    - NEVER change keys, nesting, or value types
    - NEVER include explanations outside JSON
    - Refinement modes may ONLY change which items are included, NOT the structure

    {mode_instruction}
    """

    # -------------------------
    # User prompt (schema lock)
    # -------------------------
    user_prompt = f"""
    DOCUMENT:
    \"\"\"
    {document_text}
    \"\"\"

    Extract the following elements STRICTLY from the document.

    OUTPUT SCHEMA (MANDATORY):

    {{
      "terminologies": [
        {{
          "term": string,
          "meaning": string | null,
        }}
      ],
      "figures": [
        {{
          "figure": string,
          "description": string,
        }}
      ],
      "tables": [
        {{
          "table": string,
          "title": string,
        }}
      ],
      "algorithms": [
        {{
          "algorithm": string,
          "goal": string | null,
          "process": string | null,
        }}
      ]
    }}

    EXTRACTION RULES:
    - Only extract what is explicitly stated
    - Do NOT infer or guess
    - If a category has no items, return an empty list
    - If location or line is unknown, use null
    - Do NOT merge categories
    """

    # -------------------------
    # Call LLM
    # -------------------------
    response = call_llm(system_prompt, user_prompt)

    # -------------------------
    # Enforce dict output
    # -------------------------
    if isinstance(response, str):
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {
                "terminologies": [],
                "figures": [],
                "tables": [],
                "algorithms": [],
                "_error": "LLM returned invalid JSON",
                "_raw": response
            }

    return response
