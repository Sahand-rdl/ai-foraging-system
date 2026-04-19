import os
import json
from prompt.pipeline import run_pipeline

DOCLING_FOLDER = "docling_docs"        # Folder containing Docling JSON files
OUTPUT_FOLDER = "extracted_entities"   # Folder to save pipeline outputs
ITERATIONS = 3                          # Number of iterations for run_pipeline

def extract_text_recursive(obj):
    """
    Recursively extract all 'text' fields from a JSON object.
    """
    texts = []

    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == "text" and isinstance(v, str):
                texts.append(v)
            else:
                texts.extend(extract_text_recursive(v))
    elif isinstance(obj, list):
        for item in obj:
            texts.extend(extract_text_recursive(item))
    elif isinstance(obj, str):
        texts.append(obj)

    return texts

def load_docling_json_text(path):
    """
    Load a Docling JSON file and extract all text content as a single string.
    """
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    text_parts = extract_text_recursive(data)
    return "\n".join(text_parts).strip() or "(No readable text)"

def load_pipeline_json_as_dict(path):
    """
    Load a pipeline output JSON file and return it as a Python dictionary.
    """
    if not os.path.exists(path):
        print(f"Warning: File {path} does not exist")
        return None

    with open(path, "r", encoding="utf-8") as f:
        pipeline_data = json.load(f)

    # Prepare a structure to combine all iterations
    combined = {
        "iterations": [],
        "self_assessments": []
    }

    for entry in pipeline_data:
        iteration_num = entry.get("iteration")
        extraction = entry.get("extraction", {})
        self_assessment = entry.get("self_assessment", "")

        combined["iterations"].append({
            "iteration": iteration_num,
            "extraction": extraction
        })
        combined["self_assessments"].append({
            "iteration": iteration_num,
            "self_assessment": self_assessment
        })

    return combined

def main():
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    for fname in os.listdir(DOCLING_FOLDER):
        if not fname.lower().endswith(".json"):
            continue

        out_name = fname.rsplit(".", 1)[0] + "_pipeline.json"
        out_path = os.path.join(OUTPUT_FOLDER, out_name)

        # Skip or load existing pipeline
        if os.path.exists(out_path):
            print(f"Loading existing pipeline JSON → {fname}")
            pipeline_dict = load_pipeline_json_as_dict(out_path)
            continue

        print(f"\n=== Processing {fname} ===")
        doc_path = os.path.join(DOCLING_FOLDER, fname)
        document_text = load_docling_json_text(doc_path)

        if not document_text:
            print(f"Warning: No text found in {fname}")
            continue

        # Run the pipeline
        history = run_pipeline(document_text, iterations=ITERATIONS)

        # Save output
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2, ensure_ascii=False)

        print(f"Saved → {out_path}")

        # Load as dictionary with all iterations and self_assessments
        pipeline_dict = load_pipeline_json_as_dict(out_path)

        # Example: print all self_assessment texts
        for sa in pipeline_dict["self_assessments"]:
            print(f"Iteration {sa['iteration']} self_assessment:\n{sa['self_assessment']}\n")

if __name__ == "__main__":
    main()
