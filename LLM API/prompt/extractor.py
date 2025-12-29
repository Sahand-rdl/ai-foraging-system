from .llm_core import call_llm

def extract_entities(document_text, prompt_version="v1"):
    system_prompt = """
    You are an expert academic information extraction assistant.

    Your task is to extract ONLY explicitly stated information
    from the given scientific document.

    You must:
    - Rely strictly on the provided document
    - Avoid interpretation or reasonable guessing
    - Avoid summarization or paraphrasing beyond necessity
    - Use concise, technical language

    If an item is not clearly present in the document,
    do NOT invent it and return an empty list for that category.
    """

    user_prompt = f"""
    DOCUMENT:
    \"\"\"
    {document_text}
    \"\"\"

    Extract the following elements STRICTLY from the document and the specific page number (left half or right half) and the line number.

    1. Terminologies
    - Domain-specific technical terms or concepts
    - Typically nouns or noun phrases
    - Example: "Semantic Search", "Convolutional Neural Networks"

    2. Figures
    - Explicitly referenced figures (e.g., "Figure 1", "Fig. 3")
    - Include figure number and a short description if available

    3. Tables
    - Explicitly referenced tables (e.g., "Table 1")
    - Include table number and title if available

    4. Algorithms / Processes
    - Explicitly described algorithms, workflows, or processes
    - Named methods, pipelines, or step-wise procedures
    - Example: "SSyRS-Gen process"

    Output format (JSON):

    {{
    "terminologies": [ ... ],
    "figures": [ ... ],
    "tables": [ ... ],
    "algorithms": [ ... ]
    }}

    Rules:
    - Do NOT infer missing elements
    - Do NOT merge categories
    - If a category has no entries, return an empty list
    """

    return call_llm(system_prompt, user_prompt)