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

        # 3A. DOI Search
        if metadata.get("doi"):
            enhanced_data = fetch_openalex_by_doi(metadata["doi"])

        # 3B. Title Search
        if not enhanced_data:
            clean_title = " ".join(metadata["title"].split())
            enhanced_data = fetch_openalex_by_query_best_match(clean_title)

        if enhanced_data:
            if enhanced_data.get("citation_count"):
                metadata["citation_count"] = enhanced_data["citation_count"]
            if enhanced_data.get("url"):
                metadata["url"] = enhanced_data["url"]

            if enhanced_data.get("doi") and not metadata["doi"]:
                metadata["doi"] = enhanced_data["doi"]

            if metadata["year"] == "Unknown" and enhanced_data.get("year") != "Unknown":
                metadata["year"] = enhanced_data["year"]
            if (
                metadata["venue"] == "Unknown"
                and enhanced_data.get("venue") != "Unknown Venue"
            ):
                metadata["venue"] = enhanced_data["venue"]
            if not metadata["authors"] and enhanced_data.get("authors"):
                metadata["authors"] = enhanced_data["authors"]

    # 4. DOI & URL SYNCHRONIZATION (The Consistency Sync)
    # If the URL contains a DOI, we extract it.
    if metadata["url"]:
        # Capture standard DOIs and CiteseerX IDs (10.x.x.x) from URL parameters or paths
        url_doi_match = re.search(r"(?:doi=|/)(10\.[^?&\s]+)", metadata["url"])
        if url_doi_match:
            recovered_doi = (
                url_doi_match.group(1)
                .split(".html")[0]
                .split(".pdf")[0]
                .split("&")[0]
                .rstrip("/")
            )

            # If we recovered a DOI from the URL, it is likely more "canonical" for that specific link
            # We update the doi field to match the url to prevent discrepancy
            if metadata["doi"] != recovered_doi:
                metadata["doi"] = recovered_doi

    # 5. FINAL FALLBACK: Google Scholar URL
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
    user_prompt = (
        f'DOCUMENT START:\n"""\n{text_chunk[:4000]}\n"""\nExtract metadata JSON:'
    )
    try:
        response = call_llm(system_prompt, user_prompt)
        clean_response = response.strip()
        if clean_response.startswith("```json"):
            clean_response = clean_response[7:]
        if clean_response.endswith("```"):
            clean_response = clean_response[:-3]
        start, end = clean_response.find("{"), clean_response.rfind("}") + 1
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
    try:
        url = "https://api.openalex.org/works"
        params = {"search": title, "per_page": 5, "mailto": "researcher@example.com"}
        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])
            best_match, best_score = None, -1.0
            for item in results:
                api_title = item.get("title") or ""
                sim = SequenceMatcher(None, title.lower(), api_title.lower()).ratio()
                if sim < 0.85:
                    continue
                citations = item.get("cited_by_count", 0)
                has_doi = bool(item.get("doi") or item.get("ids", {}).get("doi"))
                score = (
                    (sim * 10)
                    + min(citations / 2000.0, 5.0)
                    + (0.5 if has_doi else 0.0)
                )
                if score > best_score:
                    best_score, best_match = score, item
            if best_match:
                return parse_openalex_response(best_match)
    except Exception:
        pass
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
    title = item.get("title", "Unknown Title")
    year = str(item.get("publication_year") or "Unknown")
    authors = [
        a.get("author", {}).get("display_name")
        for a in item.get("authorships", [])
        if a.get("author", {}).get("display_name")
    ]
    venue = "Unknown Venue"
    if item.get("primary_location", {}) and item["primary_location"].get("source", {}):
        venue = item["primary_location"]["source"].get("display_name", "Unknown Venue")

    citation_count = item.get("cited_by_count", 0)
    doi, url = "", ""

    doi_raw = item.get("doi") or item.get("ids", {}).get("doi")
    if doi_raw and isinstance(doi_raw, str):
        doi = doi_raw.replace("https://doi.org/", "")
        url = doi_raw if doi_raw.startswith("http") else f"https://doi.org/{doi_raw}"

    if not url:
        if item.get("primary_location", {}).get("landing_page_url"):
            url = item["primary_location"]["landing_page_url"]
        elif item.get("best_oa_location", {}).get("landing_page_url"):
            url = item["best_oa_location"]["landing_page_url"]
        elif item.get("ids", {}).get("openalex"):
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
