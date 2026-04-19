Metadata Extraction Logic: doc_parser.py

This script follows a five-stage pipeline designed to ensure that even if external APIs fail or return messy data, the system still produces a high-quality "Identity" for the scientific paper.

1. The Ingestion Layer (Docling Processing)

The script begins by targeting the raw text provided by the Docling conversion.

Heuristic: It specifically harvests the first 4,000 characters of the document.

Why: In scientific literature, the essential metadata (Title, Authors, Journal Name, and Year) most probably resides in the first page header. Processing the entire 50-page PDF would be a waste of tokens and introduce noise.

2. Phase I: LLM-First Extraction

Before hitting any APIs, we use extract_full_metadata_llm.

Strategy: We treat the LLM as a sophisticated "Pattern Matcher." It looks at the layout and text to identify what looks like a title versus a journal header.

3. Phase II: API call

Once we have a title from the LLM, we use the OpenAlex API to find the paper's "Global Identity."

DOI Search: If the LLM found a DOI in the text, we do a direct lookup. This is the fastest and most accurate path.

Smart Title Search: If no DOI exists, we use fetch_openalex_by_query_best_match. This is where the "Genius" logic lives.

4. Phase III: The Best-Match Scoring System

OpenAlex often returns 5+ versions of the same paper. A standard search would just pick the first one, which might be a "Stub" (low citations, no DOI). Our script uses a weighted scoring formula (rewards):

Similarity (Base): Must be > 0.85 similarity to the LLM's title to even be considered.

Citation Bonus: We heavily weight the cited_by_count. A record with 8,000 citations is statistically much more likely to be the "Canonical" (original) version than a record with 500.

DOI Bonus: We give a small tie-breaker bonus if the record has a registered DOI.

Result: This ensures we ignore "Stubs" and always target the most cited, data-rich version of the artifact.

5. Phase IV: Robust Link & Fallback Resolution

The "Random Search" paper taught us that sometimes the best records have no DOI.

Deep Scanning: The parse_openalex_response function doesn't just check the doi field. It scans primary_location, best_oa_location, and the ids map for any usable landing page or PDF link.

The "Safety Net": If OpenAlex returns a high-citation record but zero links, the script invokes a Google Scholar Fallback. It encodes the title into a search URL.

Outcome: The url field is guaranteed to never be empty. The user always has a "clickable path" back to the knowledge source.

6. Phase V: Intelligent Merging

Finally, the script merges the LLM data and API data. It follows a Non-Destructive Overwrite rule:

It keeps the LLM's Title/Year (which are highly accurate to the specific PDF) but adds the API's Citation Count and DOI.

It only overwrites the Year or Venue if the API provides data and the LLM result was "Unknown."
