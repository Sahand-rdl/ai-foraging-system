from .extractor import extract_entities, reduce_extractions
import json
import re

def chunk_text(text: str, chunk_size: int = 32000, overlap: int = 1000) -> list[str]:
    """
    Splits text into chunks with overlap.
    """
    if len(text) <= chunk_size:
        return [text]
    
    # Simple sliding window chunking
    return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size - overlap)]


def run_pipeline(document_text: str, iterations=1) -> dict:
    """
    Run a conditional extraction pipeline. Uses single-pass for short docs
    and Map-Reduce for long docs.

    Args:
        document_text (str): Input scientific document text.
    """
    # Conditional Strategy: Use single-pass for documents under 300k chars (~120 pages)
    if len(document_text) < 300000:
        print(f"   ... Document is short enough ({len(document_text)} chars). Using single-pass extraction.")
        extraction = extract_entities(document_text, prompt_versions=["v1"])
        # The history format is no longer used, so we return the core extraction directly.
        return extraction
    
    # --- Proceed with Map-Reduce for very long documents ---
    print(f"   ... Document is very long ({len(document_text)} chars). Using Map-Reduce strategy.")
    
    # 1. Chunk the document
    text_chunks = chunk_text(document_text)
    print(f"   ... Document split into {len(text_chunks)} chunks.")
    
    partial_extractions = []

    # 2. Map Step: Extract entities from each chunk
    for i, chunk in enumerate(text_chunks):
        print(f"   ... Extracting from chunk {i+1}/{len(text_chunks)} (Map)...")
        extraction = extract_entities(chunk, prompt_versions=["v1"])
        if isinstance(extraction, dict):
            # We only care about the content, not metadata like _error
            if any(extraction.get(key) for key in ["terminologies", "figures", "tables", "algorithms"]):
                partial_extractions.append(json.dumps(extraction))

    # 3. Reduce Step: Combine and de-duplicate
    print(f"   ... Reducing {len(partial_extractions)} partial extractions (Reduce)...")
    if not partial_extractions:
        return {
            "terminologies": [], "figures": [], "tables": [], "algorithms": [],
            "_warning": "No entities found in any chunk."
        }
    
    final_extraction = reduce_extractions(partial_extractions)

    # The history format is no longer used, return the final result.
    # The dictionary now has a single key 'extraction' with the combined results.
    return { 'extraction': final_extraction }

