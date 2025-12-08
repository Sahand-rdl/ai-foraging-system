import os
from docling.document_converter import DocumentConverter

RAW_FOLDER = "raw_docs"
OUTPUT_FOLDER = "docling_docs"

def convert_to_markdown(src_path: str, dst_path: str):
    """
    Convert any supported document into Markdown using Docling.
    Always outputs a non-empty markdown file.
    """
    converter = DocumentConverter()
    result = converter.convert(src_path)
    doc = result.document

    # Try markdown
    try:
        md = doc.export_to_markdown()
    except:
        md = ""

    # Fallback to text
    if not md or not md.strip():
        try:
            md = doc.export_to_text()
        except:
            md = ""

    # Last fallback
    if not md.strip():
        md = f"# Document Parsed\n\n(No content detected for {os.path.basename(src_path)})\n"

    with open(dst_path, "w", encoding="utf-8") as f:
        f.write(md)


def batch_convert():
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    for fname in os.listdir(RAW_FOLDER):
        if not fname.lower().endswith((".pdf", ".docx", ".pptx", ".txt")):
            continue

        src = os.path.join(RAW_FOLDER, fname)
        dst = os.path.join(OUTPUT_FOLDER, fname.rsplit(".", 1)[0] + ".md")

        if os.path.exists(dst):
            print(f"Skipping (exists) {fname}")
            continue

        print(f"Converting {fname} …")
        convert_to_markdown(src, dst)
        print(f"Saved → {dst}")


if __name__ == "__main__":
    batch_convert()
    print("Done.")