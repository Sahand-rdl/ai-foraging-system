import re
from typing import Dict, Any


def extract_metadata_heuristics(doc_data: dict) -> Dict[str, str]:
    """
    Extracts metadata (Title, Authors, Year, Venue) using heuristics
    on the structured Docling output (v1.8.0 'texts' list).
    """
    metadata = {
        "title": "Unknown Title",
        "authors": [],
        "year": "Unknown",
        "venue": "Unknown",
    }

    # Locate content list
    content_list = []
    if "texts" in doc_data and isinstance(doc_data["texts"], list):
        content_list = doc_data["texts"]
    elif "content" in doc_data:
        content_list = doc_data["content"]

    first_page_text = ""

    for item in content_list:
        if not isinstance(item, dict):
            continue

        text = item.get("text", "")
        label = (item.get("label") or "").lower()

        # Heuristic: Title
        if label == "title" or label == "main-title":
            metadata["title"] = text

        # Accumulate first ~2000 chars
        if len(first_page_text) < 2000:
            first_page_text += text + "\n"

    # Heuristics
    year_match = re.search(r"\b(19|20)\d{2}\b", first_page_text)
    if year_match:
        metadata["year"] = year_match.group(0)

    if "arXiv" in first_page_text:
        metadata["venue"] = "arXiv Preprint"
    elif "Proceedings" in first_page_text:
        metadata["venue"] = "Conference Proceedings"
    elif "Journal" in first_page_text:
        metadata["venue"] = "Journal Article"

    return metadata
