print("prompt_batch_extract.py is running")

import os
import json
from prompt.pipeline import run_pipeline
from docling.document_converter import DocumentConverter

RAW_FOLDER = "raw_docs"        
OUTPUT_FOLDER = "extracted_entities"
ITERATIONS = 3

def load_document_text(path):
    ext = path.rsplit(".", 1)[-1].lower()
    if ext == "txt":
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read().strip()
    elif ext in ("pdf", "docx", "pptx"):
        converter = DocumentConverter()
        result = converter.convert(path)
        doc = result.document
        try:
            data = doc.export_to_dict()
        except:
            data = None
        text_parts = []
        if data and "content" in data:
            for item in data["content"]:
                if isinstance(item, dict) and "text" in item:
                    text_parts.append(item["text"])
        return "\n".join(text_parts).strip() or "(No readable text)"
    else:
        return "(Unsupported file type)"

def main():
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    for fname in os.listdir(RAW_FOLDER):
        if not fname.lower().endswith((".pdf", ".txt", ".md", ".csv")): 
            continue

        print(f"\n=== Processing {fname} ===")

        doc_path = os.path.join(RAW_FOLDER, fname)
        document_text = load_document_text(doc_path)

        history = run_pipeline(document_text, iterations=ITERATIONS)

        out_name = fname.rsplit(".", 1)[0] + "_pipeline.json"
        out_path = os.path.join(OUTPUT_FOLDER, out_name)

        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2, ensure_ascii=False)

        print(f"Saved → {out_path}")


if __name__ == "__main__":
    main()
