from .extractor import extract_entities
from .self_evaluator import check_completeness, self_assess
import json

def run_pipeline(document_text, iterations=3, prompt_versions=None):
    """
    Run iterative extraction with self-assessment feedback.

    Args:
        document_text (str): Input scientific document text.
        iterations (int): Number of extraction iterations.
        prompt_versions (list[str]): List of prompt versions to consider per iteration.
                                     If None, defaults to ["v1"].
    """
    if prompt_versions is None:
        prompt_versions = ["v1"]

    history = []

    # Initial empty feedback
    llm_feedback = ""

    for i in range(iterations):
        print(f"\n=== Iteration {i+1} ===")

        # Pass multiple versions and previous feedback to extractor
        extraction = extract_entities(
            document_text,
            prompt_versions=prompt_versions,
            feedback=llm_feedback
        )

        # Ensure JSON dict
        if isinstance(extraction, str):
            try:
                extraction_json = json.loads(extraction)
            except json.JSONDecodeError:
                extraction_json = {"error": "invalid JSON", "raw": extraction}
        else:
            extraction_json = extraction

        # Check completeness
        complete = check_completeness(extraction_json)

        # Self-assessment
        review_text = self_assess(document_text, extraction_json)
        llm_feedback = json.dumps(review_text)

        # Record
        record = {
            "iteration": i + 1,
            "prompt_versions": prompt_versions,
            "extraction": extraction_json,
            "complete": complete,
            "self_assessment": review_text
        }
        history.append(record)

        # Adaptive logic to update prompt_versions for next iteration

        new_prompt_versions = []
        if review_text["ambiguous"] != "*None*":
            new_prompt_versions.append("v_refined_disambiguation")
        if review_text["missing"] != "*None*":
            new_prompt_versions.append("v_refined_coverage")
        if not new_prompt_versions:
            new_prompt_versions.append("v1")
        prompt_versions = list(dict.fromkeys(new_prompt_versions))
        if prompt_versions == ["v1"]:
            print("No issues detected, stopping iterations early.")
            break
    return history
