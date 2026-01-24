import re
import math
import os
from pathlib import Path
from collections import Counter, defaultdict
from docling_core.types.doc import DoclingDocument

# Standard English stop words to filter out noise
EN_STOP = {
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "as",
    "at",
    "by",
    "from",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "it",
    "this",
    "that",
    "these",
    "those",
    "we",
    "you",
    "they",
    "he",
    "she",
    "i",
    "me",
    "my",
    "your",
    "our",
    "their",
    "not",
    "no",
    "do",
    "does",
    "did",
    "can",
    "could",
    "will",
    "would",
    "should",
    "may",
    "might",
    "have",
    "has",
    "had",
    "which",
    "its",
    "also",
}


def tokenize(text: str):
    """Clean, lowercase, and tokenize text."""
    text = text.lower()
    # Remove non-alphanumeric characters
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    tokens = text.split()
    # Filter stop words and short tokens
    return [t for t in tokens if t not in EN_STOP and len(t) > 2]


def get_corpus_idf(corpus_folder: str):
    """
    Calculates the Global IDF (Inverse Document Frequency) for the entire folder.
    This provides the context needed to know which words are 'rare' or 'special'.
    """
    folder = Path(corpus_folder)
    tokenized_docs = []

    if not folder.exists():
        return {}, 0

    json_files = list(folder.glob("*.json"))
    N = len(json_files)
    df = defaultdict(int)

    for p in json_files:
        try:
            doc = DoclingDocument.load_from_json(str(p))
            # Use markdown export to avoid 'strict_text' deprecation warnings in newer docling-core
            text = doc.export_to_markdown()
            tokens = set(tokenize(text))
            for token in tokens:
                df[token] += 1
        except:
            continue

    # Compute IDF: log((Total Docs + 1) / (Docs with term + 1)) + 1
    # The +1s prevent division by zero and log(0)
    idf = {token: math.log((N + 1) / (df_t + 1)) + 1 for token, df_t in df.items()}

    return idf, N


def analyze_document_tfidf(doc_filename: str, corpus_folder: str, top_n: int = 10):
    """
    Calculates TF-IDF specifically for one document.
    1. Builds IDF from the whole corpus.
    2. Calculates TF for the target document.
    3. Multiplies them to find the most 'distinctive' keywords.
    """
    # 1. Get Global Context
    idf, N = get_corpus_idf(corpus_folder)

    # 2. Load and Tokenize target document
    target_path = Path(corpus_folder) / doc_filename
    if not target_path.exists():
        return []

    try:
        doc = DoclingDocument.load_from_json(str(target_path))
        text = doc.export_to_markdown()
        tokens = tokenize(text)
    except Exception as e:
        print(f"Error processing document: {e}")
        return []

    if not tokens:
        return []

    # 3. Calculate TF (Term Frequency)
    counts = Counter(tokens)
    doc_len = len(tokens)

    tfidf_scores = {}
    for token, count in counts.items():
        tf = count / doc_len
        # If token was never in the corpus (new file), use a default IDF
        token_idf = idf.get(token, math.log((N + 1) / 1) + 1)
        tfidf_scores[token] = tf * token_idf

    # 4. Sort and return top N
    sorted_keywords = sorted(tfidf_scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_keywords[:top_n]
