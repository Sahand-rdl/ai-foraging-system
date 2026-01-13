import re
import requests
import json
import urllib.parse
from difflib import SequenceMatcher
from typing import Dict, Any, List
from .llm_core import call_llm


def extract_metadata_heuristics(doc_data: dict) -> Dict[str, Any]:
    """
    Extracts metadata using an LLM-First approach with OpenAlex as primary API.
    Guarantees a URL by falling back to Google Scholar search.
    """
    metadata = {
        "title": "Unknown Title",
        "authors": [],
        "year": "Unknown",
        "venue": "Unknown",
        "citation_count": 0,
        "url": "",
        "doi": "",
    }

    # 1. Locate content
    content_list = []
    if "texts" in doc_data and isinstance(doc_data["texts"], list):
        content_list = doc_data["texts"]
    elif "content" in doc_data:
        content_list = doc_data["content"]

    if not content_list:
        return metadata

    first_page_text = ""
    for item in content_list:
        if not isinstance(item, dict):
            continue
        text = item.get("text", "").strip()
        if len(first_page_text) < 4000:
            first_page_text += text + "\n"

    # 2. LLM EXTRACTION
    # print("DEBUG: Running LLM extraction on RAW text...")
    llm_metadata = extract_full_metadata_llm(first_page_text)

    if llm_metadata.get("title") and llm_metadata["title"] != "Unknown Title":
        metadata["title"] = llm_metadata["title"]
    if llm_metadata.get("authors"):
        metadata["authors"] = llm_metadata["authors"]
    if llm_metadata.get("year") != "Unknown":
        metadata["year"] = llm_metadata["year"]
    if llm_metadata.get("venue") != "Unknown":
        metadata["venue"] = llm_metadata["venue"]
    if llm_metadata.get("doi"):
        metadata["doi"] = llm_metadata["doi"]

    # 3. API ENRICHMENT (OpenAlex)
    if metadata["title"] != "Unknown Title":
        enhanced_data = None

        if metadata.get("doi"):
            enhanced_data = fetch_openalex_by_doi(metadata["doi"])

        if not enhanced_data:
            clean_title = " ".join(metadata["title"].split())
            # print(f"DEBUG: Querying OpenAlex for title: '{clean_title}'")
            enhanced_data = fetch_openalex_by_query_best_match(clean_title)

        if enhanced_data:
            # print(f"DEBUG: API Match Found: '{enhanced_data.get('title')}'")
            if enhanced_data.get("citation_count"):
                metadata["citation_count"] = enhanced_data["citation_count"]
            if enhanced_data.get("url"):
                metadata["url"] = enhanced_data["url"]
            if enhanced_data.get("doi") and not metadata["doi"]:
                metadata["doi"] = enhanced_data["doi"]

            # Merge year/venue/authors if unknown
            if metadata["year"] == "Unknown" and enhanced_data.get("year") != "Unknown":
                metadata["year"] = enhanced_data["year"]
            if (
                metadata["venue"] == "Unknown"
                and enhanced_data.get("venue") != "Unknown Venue"
            ):
                metadata["venue"] = enhanced_data["venue"]
            if enhanced_data.get("authors") and len(enhanced_data["authors"]) >= len(
                metadata["authors"]
            ):
                metadata["authors"] = enhanced_data["authors"]

    # 4. FINAL FALLBACK: Google Scholar URL
    if not metadata["url"] and metadata["title"] != "Unknown Title":
        encoded_title = urllib.parse.quote(metadata["title"])
        metadata["url"] = f"https://scholar.google.com/scholar?q={encoded_title}"

    return metadata


def extract_full_metadata_llm(text_chunk: str) -> Dict[str, Any]:
    system_prompt = """
    You are a bibliographic data extractor. 
    Analyze the text and extract the Paper Title, Authors, Publication Year, Venue, and DOI.
    Return JSON with keys: "title", "authors", "year", "venue", "doi".
    """
    user_prompt = f"""
    DOCUMENT START:
    \"\"\"
    {text_chunk[:4000]}
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
                "doi": data.get("doi") or "",
            }
    except Exception:
        pass
    return {
        "title": "Unknown Title",
        "authors": [],
        "year": "Unknown",
        "venue": "Unknown",
        "doi": "",
    }


def fetch_openalex_by_query_best_match(title: str) -> Dict[str, Any]:
    """
    Fetches results and picks the best match based on Similarity AND Citation Count.
    Prioritizes high-citation canonical records over 'stub' DOI records.
    """
    try:
        url = "https://api.openalex.org/works"
        params = {"search": title, "per_page": 5, "mailto": "researcher@example.com"}
        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])

            best_match = None
            best_score = -1.0

            for item in results:
                api_title = item.get("title") or ""
                sim = SequenceMatcher(None, title.lower(), api_title.lower()).ratio()

                if sim < 0.85:
                    continue

                # NEW SCORING LOGIC:
                # 1. Similarity is the foundation (0 to 10 points)
                # 2. Citations provide significant weight to find the "Main" record
                #    A paper with 8000 citations is far more likely to be the canonical
                #    version than one with 500.
                citations = item.get("cited_by_count", 0)
                has_doi = bool(item.get("doi"))

                # Bonus for high citation count (max +5.0 points for 10k citations)
                citation_bonus = min(citations / 2000.0, 5.0)

                # Small bonus for DOI (+0.5) - enough to break ties,
                # but not enough to pick a stub version over a canonical version.
                doi_bonus = 0.5 if has_doi else 0.0

                score = (sim * 10) + citation_bonus + doi_bonus

                if score > best_score:
                    best_score = score
                    best_match = item

            if best_match:
                return parse_openalex_response(best_match)
    except Exception as e:
        print(f"OpenAlex Error: {e}")
    return None


def fetch_openalex_by_doi(doi: str) -> Dict[str, Any]:
    try:
        clean_doi = doi.replace("https://doi.org/", "").strip()
        url = f"https://api.openalex.org/works/doi:{clean_doi}"
        response = requests.get(
            url, params={"mailto": "researcher@example.com"}, timeout=5
        )
        if response.status_code == 200:
            return parse_openalex_response(response.json())
    except Exception:
        pass
    return None


def parse_openalex_response(item: dict) -> Dict[str, Any]:
    """
    Parses OpenAlex Work object into a standardized metadata dict.
    Deep-scans for a usable landing page URL.
    """
    title = item.get("title", "Unknown Title")
    year = str(item.get("publication_year") or "Unknown")

    authors = []
    if item.get("authorships"):
        for author in item.get("authorships", []):
            if author.get("author", {}).get("display_name"):
                authors.append(author["author"]["display_name"])

    venue = "Unknown Venue"
    if item.get("primary_location", {}) and item["primary_location"].get("source", {}):
        venue = item["primary_location"]["source"].get("display_name", "Unknown Venue")

    citation_count = item.get("cited_by_count", 0)

    doi = ""
    url = ""

    # 1. Primary DOI check
    doi_raw = item.get("doi")
    if doi_raw and isinstance(doi_raw, str):
        doi = doi_raw.replace("https://doi.org/", "")
        url = doi_raw

    # 2. Falling back to alternative IDs for URL
    if not url:
        # Check landing_page_url in primary_location
        if item.get("primary_location") and item["primary_location"].get(
            "landing_page_url"
        ):
            url = item["primary_location"]["landing_page_url"]
        # Check best_oa_location
        elif item.get("best_oa_location") and item["best_oa_location"].get(
            "landing_page_url"
        ):
            url = item["best_oa_location"]["landing_page_url"]
        # Final API fallback to OpenAlex ID page
        elif item.get("ids") and item["ids"].get("openalex"):
            url = item["ids"]["openalex"]

    return {
        "title": title,
        "authors": authors,
        "year": year,
        "venue": venue,
        "citation_count": citation_count,
        "url": url,
        "doi": doi,
    }
