from .extractor import extract_entities
from .self_evaluator import check_completeness, self_assess
import json

def run_pipeline(document_text, iterations=3):
    history = []
    prompt_version = "v1"

    for i in range(iterations):
        print(f"\n=== Iteration {i+1} ===")

        extraction = extract_entities(document_text, prompt_version)

        if isinstance(extraction, str):
            try:
                extraction_json = json.loads(extraction)
            except json.JSONDecodeError:
                extraction_json = {"error": "invalid JSON", "raw": extraction}
        else:
            extraction_json = extraction

        complete = check_completeness(extraction_json)

        review = self_assess(document_text, extraction_json)
        review_text = review if isinstance(review, str) else ""

        record = {
            "iteration": i + 1,
            "prompt_version": prompt_version,
            "extraction": extraction_json,
            "complete": complete,
            "self_assessment": review_text
        }
        history.append(record)

        if "ambiguous" in review_text.lower():
            prompt_version = "v_refined_disambiguation"
        elif "missing" in review_text.lower():
            prompt_version = "v_refined_coverage"

    return history