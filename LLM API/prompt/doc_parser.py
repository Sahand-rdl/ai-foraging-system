import re
import requests
import json
from difflib import SequenceMatcher
from typing import Dict, Any
from .llm_core import call_llm


def extract_metadata_heuristics(doc_data: dict) -> Dict[str, Any]:
    """
    Extracts metadata (Title, Authors, Year, Venue) using a hybrid approach:
    1. Heuristics on Docling output.
    2. LLM-based extraction (Critical fallback).
    3. Semantic Scholar API (Verification/Enrichment).
    """
    metadata = {
        "title": "Unknown Title",
        "authors": [],
        "year": "Unknown",
        "venue": "Unknown",
        "citation_count": 0,
        "url": "",
    }

    # 1. Locate content list
    content_list = []
    if "texts" in doc_data and isinstance(doc_data["texts"], list):
        content_list = doc_data["texts"]
    elif "content" in doc_data:
        content_list = doc_data["content"]

    if not content_list:
        return metadata

    first_page_text = ""
    found_title_heuristic = False

    # 2. Heuristic Pass & Text Accumulation
    for i, item in enumerate(content_list):
        if not isinstance(item, dict):
            continue

        text = item.get("text", "").strip()
        label = (item.get("label") or "").lower()

        # Accumulate first page text (limit to ~3000 chars)
        if len(first_page_text) < 3000:
            first_page_text += text + "\n"

        if "abstract" in text.lower() or "abstract" in label:
            break

        # Improved Venue/Header Detection Regex
        is_venue_pattern = re.search(
            r"^(Journal|Proceedings|Vol\.|Volume|Issue|arXiv|Submitted to|Published|Page \d)",
            text,
            re.IGNORECASE,
        )
        # Matches citation-like strings: "Name et al., 2020", "2012", "13 (2012)"
        is_citation_pattern = (
            re.search(r"\d{4}.*\d+-\d+", text)
            or re.match(r"^\d{4}$", text)
            or re.search(r"\d+\s*\(\d{4}\)", text)
        )

        # Heuristic 1: Explicit Label
        if not found_title_heuristic and label in [
            "title",
            "main-title",
            "doc-title",
            "section_header",
        ]:
            if len(text) > 5 and not re.match(r"^\d", text) and not is_venue_pattern:
                metadata["title"] = text
                found_title_heuristic = True

        # Heuristic 2: First substantial text block (ignoring venues/citations)
        if (
            not found_title_heuristic
            and i == 0
            and len(text) > 10
            and not is_venue_pattern
            and not is_citation_pattern
        ):
            metadata["title"] = text
            found_title_heuristic = True

    # 3. FORCE LLM Extraction (The "Smart" Step)
    # Clean the text before sending to LLM to remove distraction
    # Remove lines that look like Journal headers so LLM focuses on real title
    clean_page_text = re.sub(
        r"^(Journal|Proceedings|Vol\.|Submitted|Published|Page).*$",
        "",
        first_page_text,
        flags=re.MULTILINE | re.IGNORECASE,
    )

    llm_metadata = extract_full_metadata_llm(clean_page_text)

    # --- SMART MERGE LOGIC ---

    # 3.1 Title Selection: Trust LLM if Heuristic is suspicious OR LLM is confident and different
    heuristic_title = metadata["title"]
    llm_title = llm_metadata.get("title", "Unknown Title")

    # Check if heuristic looks bad (contains "Journal", "Research", "Vol")
    heuristic_looks_bad = (
        heuristic_title == "Unknown Title"
        or len(heuristic_title) < 5
        or "Journal" in heuristic_title
        or "Proceedings" in heuristic_title
        or bool(re.search(r"\d{4}", heuristic_title))
    )

    if llm_title != "Unknown Title":
        if heuristic_looks_bad:
            metadata["title"] = llm_title
        else:
            # Even if heuristic looks ok, if LLM found a DIFFERENT title, calculate similarity.
            # If they are very different (< 0.5 similarity), PREFER LLM.
            # Rationale: LLM reads context. Heuristic reads line 1. LLM is smarter.
            sim = SequenceMatcher(
                None, heuristic_title.lower(), llm_title.lower()
            ).ratio()
            if sim < 0.5:
                # One last sanity check: Is LLM title just "Introduction"?
                if "introduction" not in llm_title.lower():
                    metadata["title"] = llm_title

    # 3.2 Authors Selection
    if llm_metadata.get("authors") and not metadata["authors"]:
        metadata["authors"] = llm_metadata["authors"]

    # 3.3 Year/Venue Selection (Always trust LLM if unknown)
    if metadata["year"] == "Unknown" and llm_metadata.get("year") != "Unknown":
        metadata["year"] = llm_metadata["year"]

    if metadata["venue"] == "Unknown" and llm_metadata.get("venue") != "Unknown":
        metadata["venue"] = llm_metadata["venue"]

    # 4. Enhance with Semantic Scholar API (Best Effort)
    if metadata["title"] != "Unknown Title":
        # Double check we aren't searching for a venue string
        if not re.search(
            r"^(Journal of|Proceedings of)", metadata["title"], re.IGNORECASE
        ):
            clean_title = " ".join(metadata["title"].split())
            enhanced_data = fetch_semantic_scholar_data(clean_title)

            if enhanced_data:
                api_title = enhanced_data.get("title", "")
                similarity = SequenceMatcher(
                    None, clean_title.lower(), api_title.lower()
                ).ratio()

                if similarity > 0.4:
                    if (
                        enhanced_data.get("venue")
                        and enhanced_data["venue"] != "Unknown Venue"
                    ):
                        metadata["venue"] = enhanced_data["venue"]
                    if enhanced_data.get("year") and enhanced_data["year"] != "Unknown":
                        metadata["year"] = enhanced_data["year"]
                    if enhanced_data.get("citation_count"):
                        metadata["citation_count"] = enhanced_data["citation_count"]
                    if enhanced_data.get("url"):
                        metadata["url"] = enhanced_data["url"]

                    if enhanced_data.get("authors") and len(
                        enhanced_data["authors"]
                    ) >= len(metadata["authors"]):
                        metadata["authors"] = enhanced_data["authors"]

    # 5. Final Fallbacks for Year using Regex
    if metadata["year"] == "Unknown":
        year_match = re.search(r"\b(19|20)\d{2}\b", first_page_text)
        if year_match:
            metadata["year"] = year_match.group(0)

    # 6. Final "Fill in the Blanks" with LLM
    if metadata["authors"] == [] and llm_metadata.get("authors"):
        metadata["authors"] = llm_metadata["authors"]
    if metadata["year"] == "Unknown" and llm_metadata.get("year") != "Unknown":
        metadata["year"] = llm_metadata["year"]
    if metadata["venue"] == "Unknown" and llm_metadata.get("venue") != "Unknown":
        metadata["venue"] = llm_metadata["venue"]

    return metadata


def extract_full_metadata_llm(text_chunk: str) -> Dict[str, Any]:
    """
    Uses the LLM to identify Title, Authors, Year, AND Venue from raw text.
    """
    system_prompt = """
    You are a bibliographic data extractor. 
    Extract the Title, Authors (list of names), Publication Year, and Venue (Conference/Journal) from the text.
    
    CRITICAL RULES:
    - The Title is NOT the Journal name (e.g. "Journal of ML Research").
    - The Title is NOT "Submitted to...".
    - Look for the large, main heading.
    
    Return JSON only with keys: "title", "authors", "year", "venue".
    - "year": String (e.g., "2012"). If missing, use "Unknown".
    - "venue": String (e.g., "NeurIPS", "arXiv"). If missing, use "Unknown".
    """

    user_prompt = f"""
    TEXT:
    \"\"\"
    {text_chunk[:3000]}
    \"\"\"
    
    Extract metadata JSON:
    """

    try:
        response = call_llm(system_prompt, user_prompt)

        clean_response = response.strip()
        if clean_response.startswith("```json"):
            clean_response = clean_response[7:]
        if clean_response.endswith("```"):
            clean_response = clean_response[:-3]

        start = clean_response.find("{")
        end = clean_response.rfind("}") + 1
        if start != -1 and end != -1:
            data = json.loads(clean_response[start:end])
            return {
                "title": data.get("title") or "Unknown Title",
                "authors": data.get("authors") or [],
                "year": str(data.get("year") or "Unknown"),
                "venue": data.get("venue") or "Unknown",
            }
    except Exception as e:
        pass

    return {
        "title": "Unknown Title",
        "authors": [],
        "year": "Unknown",
        "venue": "Unknown",
    }


def fetch_semantic_scholar_data(title: str) -> Dict[str, Any]:
    """
    Queries Semantic Scholar API. Returns None if 429/Error.
    """
    try:
        search_url = "https://api.semanticscholar.org/graph/v1/paper/search"
        params = {
            "query": title,
            "limit": 1,
            "fields": "title,authors,year,venue,citationCount,url",
        }

        response = requests.get(search_url, params=params, timeout=5)

        if response.status_code == 429:
            return None

        if response.status_code == 200:
            data = response.json()
            if data.get("total", 0) > 0 and data.get("data"):
                paper = data["data"][0]
                return {
                    "title": paper.get("title"),
                    "authors": [a["name"] for a in paper.get("authors", [])],
                    "year": str(paper.get("year", "Unknown")),
                    "venue": paper.get("venue") or "Unknown Venue",
                    "citation_count": paper.get("citationCount", 0),
                    "url": paper.get("url", ""),
                }
    except Exception:
        return None
    return None
