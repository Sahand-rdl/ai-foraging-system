import json
from .llm_core import call_llm

def extract_key_sections(docling_json: dict) -> str:
    """
    Optimization: Instead of sending 50 pages to the LLM, we extract 
    only the high-value sections for trustworthiness evaluation.
    
    Target Sections: Abstract, Introduction, Conclusion, Discussion.
    """
    kept_text = []
    
    # If docling_json is just the full text string (simplest case for now)
    if isinstance(docling_json, str):
        # Fallback: Take first 3000 chars and last 2000 chars
        return docling_json[:3000] + "\n\n... [CONTENT TRUNCATED] ...\n\n" + docling_json[-2000:]
        
    return "\n".join(kept_text)

def trust_checker(document_text: str):
    """
    Evaluates a scientific paper for trustworthiness on a 1-3 scale.
    
    Scale:
    1 = Bad (Low credibility, unclear, poor source)
    2 = Ok (Acceptable, average standard)
    3 = Good (High credibility, reputable source, clear contribution)
    """
    
    # 1. Construct System Prompt
    system_prompt = f"""
    You are an expert AI Research Assistant. Evaluate the trustworthiness of the provided scientific paper.
    
    You must output a JSON object with these exact keys:
    - trustworthiness_score (1-3): 
        1 = Bad (Low credibility, unclear, poor venue/source)
        2 = Ok (Standard quality, acceptable)
        3 = Good (High credibility, prestigious venue, highly cited, or exceptional clarity)
    - reason: A concise explanation of your score (max 2 sentences).
    
    Do NOT include markdown formatting (like ```json). Just return the raw JSON string.
    """

    # 2. Construct User Prompt
    user_prompt = f"""
    DOCUMENT:\"\"\"{document_text}\"\"\" 
    
    Expected JSON format:
    {{
      "trustworthiness_score": 1-10,
      "reason": "..."
    }}
    """

    # 3. Call LLM
    try:
        raw_response = call_llm(system_prompt, user_prompt)
        
        # 4. Clean & Parse JSON
        start_idx = raw_response.find('{')
        end_idx = raw_response.rfind('}') + 1
        
        if start_idx == -1 or end_idx == 0:
            raise ValueError("LLM did not return valid JSON")
            
        json_str = raw_response[start_idx:end_idx]
        return json.loads(json_str)

    except Exception as e:
        return {
            "trustworthiness_score": 0,
            "reason": f"Evaluation failed: {str(e)}"
        }