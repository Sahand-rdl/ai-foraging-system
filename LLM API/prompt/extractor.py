from .llm_core import call_llm
import json

def extract_entities(document_text, prompt_versions=None, feedback=""):
    """
    Extract structured entities from a scientific document.

    Args:
        document_text (str): Input text.
        prompt_versions (list[str]): List of prompt versions to consider.
        feedback (str): Feedback from previous iteration.
    """
    if prompt_versions is None:
        prompt_versions = ["v1"]

    # Combine mode instructions from multiple versions
    mode_instructions = []
    for version in prompt_versions:
        if version == "v1":
            mode_instructions.append(
                "MODE: BASELINE EXTRACTION - Extract only explicitly stated items, conservative, no disambiguation"
            )
        if version == "v_refined_disambiguation":
            mode_instructions.append(
                "MODE: DISAMBIGUATION - Remove ambiguous items, prefer exact mentions, exclude uncertainty"
            )
        if version == "v_refined_coverage":
            mode_instructions.append(
                "MODE: COVERAGE - Add clearly stated items that may have been missed"
            )

    mode_instruction_text = "\n".join(mode_instructions)

    # System prompt with feedback included
    system_prompt = f"""
    You are an information extraction FUNCTION, not a writer.

    Your job is to extract structured information from a scientific document.

    CRITICAL RULES:
    - ALWAYS output valid JSON
    - ALWAYS follow the EXACT schema provided
    - NEVER change keys, nesting, or value types
    - NEVER include explanations outside JSON
    - Refinement modes may ONLY change which items are included, NOT the structure

    {mode_instruction_text}

    PREVIOUS ITERATION FEEDBACK:
    {feedback}
    """

    user_prompt = f"""
    DOCUMENT:
    \"\"\"{document_text}\"\"\"

    Extract the following elements STRICTLY from the document.

    OUTPUT SCHEMA (MANDATORY):
    {{
    "terminologies": [{{"term": string, "meaning": string | null}}],
    "figures": [{{"figure": string, "description": string}}],
    "tables": [{{"table": string, "title": string}}],
    "algorithms": [{{"algorithm": string, "goal": string | null, "process": string | null}}]
    }}

    EXTRACTION RULES:
    - Only extract explicitly stated items
    - Do NOT infer or guess
    - If a category has no items, return an empty list
    - Do NOT merge categories
    """

    response = call_llm(system_prompt, user_prompt)

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
