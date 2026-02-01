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
    "terminologies": [{{"term": string, "meaning": string}}],
    "figures": [{{"figure": string, "description": string}}],
    "tables": [{{"table": string, "title": string}}],
    "algorithms": [{{"algorithm": string, "goal": string | null, "process": string}}]
    }}

    EXTRACTION RULES:
    - Only extract explicitly stated items
    - Do NOT infer or guess
    - If a category has no items, return an empty list
    - Do NOT merge categories
    - Do NOT output terms that don't have meanings
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

def reduce_extractions(list_of_json_strings: list[str]):
    """
    Combines and de-duplicates multiple JSON extractions from document chunks.
    """
    if not list_of_json_strings:
        return {
            "terminologies": [],
            "figures": [],
            "tables": [],
            "algorithms": [],
        }

    # Prepare the input for the reducer LLM
    combined_input = "\n\n".join([f"CHUNK_EXTRACTION_{i+1}:\n{s}" for i, s in enumerate(list_of_json_strings)])

    system_prompt = """
    You are an information aggregation and de-duplication FUNCTION.

    Your job is to combine multiple partial JSON extractions from a scientific document.

    CRITICAL RULES:
    - ALWAYS output valid JSON
    - ALWAYS follow the EXACT schema provided
    - NEVER change keys, nesting, or value types
    - NEVER include explanations outside JSON
    - De-duplicate items based on their primary identifiers (e.g., 'term' for terminologies, 'figure' for figures).
    - If multiple entries for the same item exist, prefer the entry with more complete or accurate information.
    - If a category has no items after combination, return an empty list.
    """

    user_prompt = f"""
    Below are several JSON extractions from different parts of a document.
    Combine them into a single, de-duplicated JSON object.

    {combined_input}

    OUTPUT SCHEMA (MANDATORY, MUST CONTAIN ALL CATEGORIES):
    {{
    "terminologies": [{{"term": string, "meaning": string}}],
    "figures": [{{"figure": string, "description": string}}],
    "tables": [{{"table": string, "title": string}}],
    "algorithms": [{{"algorithm": string, "goal": string | null, "process": string}}]
    }}

    COMBINATION RULES:
    - For 'terminologies', de-duplicate by 'term'.
    - For 'figures', de-duplicate by 'figure'.
    - For 'tables', de-duplicate by 'table'.
    - For 'algorithms', de-duplicate by 'algorithm'.
    - Ensure all original fields ('meaning', 'description', 'title', 'goal', 'process') are preserved or intelligently merged.
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
                "_error": "LLM returned invalid JSON during reduction",
                "_raw": response
            }

    return response

