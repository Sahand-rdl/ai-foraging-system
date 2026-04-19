import os
import json
from docling.document_converter import DocumentConverter

RAW_FOLDER = "raw_docs"
OUTPUT_FOLDER = "docling_docs"

def convert_to_json(src_path: str, dst_path: str):
    converter = DocumentConverter()
    result = converter.convert(src_path)
    doc = result.document

    try:
        data = doc.export_to_dict()
    except:
        data = None

    if not data:
        data = {
            "filename": os.path.basename(src_path),
            "error": "Docling returned no structured content.",
            "content": []
        }

    with open(dst_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def batch_convert():
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    for fname in os.listdir(RAW_FOLDER):
        if not fname.lower().endswith((".pdf", ".docx", ".pptx", ".txt")):
            continue

        src = os.path.join(RAW_FOLDER, fname)
        dst = os.path.join(OUTPUT_FOLDER, fname.rsplit(".", 1)[0] + ".json")

        if os.path.exists(dst):
            print(f"Skipping (exists) {fname}")
            continue

        print(f"Converting {fname} …")
        convert_to_json(src, dst)
        print(f"Saved → {dst}")


if __name__ == "__main__":
    batch_convert()
    print("Done.")
