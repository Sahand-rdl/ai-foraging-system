from extractor import extract_entities
from self_evaluator import check_completeness, self_assess

def run_pipeline(document_text, iterations=3):
    history = []

    prompt_version = "v1"

    for i in range(iterations):
        print(f"\n=== Iteration {i+1} ===")

        extraction = extract_entities(document_text, prompt_version)
        complete = check_completeness(extraction)
        review = self_assess(document_text, extraction)

        record = {
            "iteration": i + 1,
            "prompt_version": prompt_version,
            "extraction": extraction,
            "complete": complete,
            "self_assessment": review
        }

        history.append(record)

        # Prompt only refined based on review text
        if "ambiguous" in review.lower():
            prompt_version = "v_refined_disambiguation"
        elif "missing" in review.lower():
            prompt_version = "v_refined_coverage"

    return history