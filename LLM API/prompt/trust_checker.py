import json
from .llm_core import call_llm


def extract_key_sections(doc_data: dict) -> str:
    """
    Extracts high-value sections (Abstract, Intro, Conclusion)
    from Docling v1.8.0 JSON structure.
    """
    targets = ["abstract", "introduction", "conclusion", "discussion", "summary"]
    kept_text = []

    # 1. Handle String Input (Fallback)
    if isinstance(doc_data, str):
        return (
            doc_data[:3000] + "\n\n... [CONTENT TRUNCATED] ...\n\n" + doc_data[-2000:]
        )

    # 2. LOCATE CONTENT
    # Your files use the 'texts' key for the actual text content
    content_list = []
    if "texts" in doc_data and isinstance(doc_data["texts"], list):
        content_list = doc_data["texts"]
    elif "content" in doc_data:
        content_list = doc_data["content"]
    elif "main_text" in doc_data:
        content_list = doc_data["main_text"]

    # 3. Iterate and Extract
    capture_mode = False

    for item in content_list:
        if not isinstance(item, dict):
            continue

        # In Docling v1.8, the text is under 'text' and label under 'label'
        text = item.get("text", "").strip()
        # label might be missing or None
        label = (item.get("label") or "").lower()

        # Check for Headers
        if "header" in label or label == "title" or label == "section_header":
            if any(t in text.lower() for t in targets):
                capture_mode = True
                kept_text.append(f"\n--- {text.upper()} ---\n")
                continue
            else:
                if capture_mode:
                    capture_mode = False

        if capture_mode:
            kept_text.append(text)

    # 4. Fallback: If no sections found, dump all text from 'texts' list
    if not kept_text:
        full_text_list = [
            item.get("text", "") for item in content_list if isinstance(item, dict)
        ]
        full_text = " ".join(full_text_list)

        if not full_text:
            # Last resort
            full_text = str(doc_data)

        return (
            full_text[:3000] + "\n\n... [CONTENT TRUNCATED] ...\n\n" + full_text[-2000:]
        )

    return "\n".join(kept_text)


def trust_checker(document_text: str):
    """
    Evaluates a scientific paper for trustworthiness on a 1-3 scale.
    Scale:
    1 = Bad
    2 = Ok
    3 = Good
    """

    system_prompt = """
    You are an expert AI Research Assistant. Evaluate the trustworthiness of the provided scientific paper.
    
    You must output a JSON object with these exact keys:
    - trustworthiness_score (1-3): 
        1 = Bad (Low credibility, unclear, poor venue/source)
        2 = Ok (Standard quality, acceptable)
        3 = Good (High credibility, prestigious venue, highly cited, or exceptional clarity)
    - reason: A concise explanation of your score (max 2 sentences).
    
    Do NOT include markdown formatting (like ```json). Just return the raw JSON string.
    """

    user_prompt = f"""
    DOCUMENT:\"\"\"{document_text}\"\"\" 
    
    Expected JSON format:
    {{
      "trustworthiness_score": 1-3,
      "reason": "..."
    }}
    """

    try:
        if not document_text.strip():
            return {
                "trustworthiness_score": 0,
                "reason": "Error: The document text extraction failed, so no content was sent to the AI.",
            }

        raw_response = call_llm(system_prompt, user_prompt)

        start_idx = raw_response.find("{")
        end_idx = raw_response.rfind("}") + 1

        if start_idx == -1 or end_idx == 0:
            raise ValueError("LLM did not return valid JSON")

        json_str = raw_response[start_idx:end_idx]
        return json.loads(json_str)

    except Exception as e:
        return {"trustworthiness_score": 0, "reason": f"Evaluation failed: {str(e)}"}
