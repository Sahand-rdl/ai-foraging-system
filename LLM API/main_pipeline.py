import os
import json
from typing import Dict, Any

from docling_doc import convert_to_json
from prompt.trust_checker import trust_checker, extract_key_sections
from prompt.evaluator import evaluate_importance
from embeddings.ingestor import run_ingestion
from embeddings.searchEngine import KnowledgeSearch
from prompt.doc_parser import extract_metadata_heuristics
from tfidf import analyze_document_tfidf
from embeddings.chatter import ScientificAssistant
from prompt.pipeline import run_pipeline
from prompt_batch_extract import load_docling_json_text

from config import PROCESSED_DOCS_DIR, RAW_DOCS_BASE_DIR

def run_automatic_pipeline(
    raw_doc_path: str,
    project_definition: str,
) -> Dict[str, Any]:
    """
    Runs the full automatic processing pipeline for a single document.
    """
    if not os.path.exists(raw_doc_path):
        raise FileNotFoundError(f"Raw document not found at: {raw_doc_path}")

    file_name = os.path.basename(raw_doc_path)
    base_name = os.path.splitext(file_name)[0]
    
    # Use the new static config path to define the output location
    processed_doc_path = os.path.join(PROCESSED_DOCS_DIR, f"{base_name}.json")

    # 1. Parse the document
    print(f"1. Parsing document: {file_name}")
    convert_to_json(raw_doc_path, processed_doc_path)
    with open(processed_doc_path, "r", encoding="utf-8") as f:
        doc_data = json.load(f)
    print("   ... Parsing complete.")

    # 2. Run Metadata Extraction
    print("2. Running Metadata Extraction...")
    metadata = extract_metadata_heuristics(doc_data)
    print("   ... Metadata Extraction complete.")

    # 3. Run Trust Checker
    print("3. Running Trust Checker...")
    key_sections = extract_key_sections(doc_data)
    trust_result = trust_checker(key_sections)
    print("   ... Trust Checker complete.")

    # 4. Run Entity Extractor
    print("4. Running Entity Extractor...")
    full_text = load_docling_json_text(processed_doc_path)
    pipeline_history = run_pipeline(full_text, iterations=1)
    entities = pipeline_history[-1]["extraction"] if pipeline_history else {}
    
    # 5. TF-IDF for tags
    print("5. Generating tags (TF-IDF)...")
    # The corpus is the entire flat directory of processed documents
    tags_with_scores = analyze_document_tfidf(f"{base_name}.json", PROCESSED_DOCS_DIR)
    tags = [tag for tag, score in tags_with_scores]
    print("   ... Tag generation complete.")

    # 6. Run Relevancy Checker
    print("6. Running Relevancy Checker...")
    relevance_result = evaluate_importance(full_text, project_definition)
    if isinstance(relevance_result, str):
        try:
            relevance_result = json.loads(relevance_result)
        except json.JSONDecodeError:
            relevance_result = {}
    print("   ... Relevancy Checker complete.")

    # 7. Run Ingestion for embeddings
    print("7. Ingesting document for semantic search...")
    run_ingestion()
    print("   ... Ingestion complete.")

    # 8. Assemble the final output
    pipeline_output = {
        "extracted_path": processed_doc_path,
        "metadata": metadata,
        "trust_result": trust_result,
        "tags": tags,
        "relevance": (
            relevance_result.get("relevance_score") or 0.0
            if isinstance(relevance_result, dict)
            else 0.0
        ),
        "knowledge_artifacts": entities,
    }

    return pipeline_output


def run_search(query: str, search_type: str = "semantic"):
    """
    Performs a search across all documents.
    """
    searcher = KnowledgeSearch()
    if search_type == "semantic":
        return searcher.semantic_search(query)
    else:  # keyword
        return searcher.keyword_search(query)


def run_chat(doc_id: str, query: str):
    """
    Initiates a chat with a document.
    """
    assistant = ScientificAssistant()
    assistant.set_active_document(doc_id)
    return assistant.ask(query)


if __name__ == "__main__":
    # Example usage of the automatic pipeline
    print("===== Running Automatic Pipeline =====")
    
    try:
        # To make this test runnable, we'll look in the first subdirectory of the raw docs path
        # This simulates a real project structure like '.../raw/1/'
        first_project_dir = None
        if os.path.exists(RAW_DOCS_BASE_DIR):
            subdirs = [d for d in os.listdir(RAW_DOCS_BASE_DIR) if os.path.isdir(os.path.join(RAW_DOCS_BASE_DIR, d))]
            if subdirs:
                first_project_dir = os.path.join(RAW_DOCS_BASE_DIR, subdirs[0])

        if not first_project_dir:
            raise FileNotFoundError(
                f"No project subdirectories found in '{RAW_DOCS_BASE_DIR}' to find test PDFs."
            )

        pdf_files = [f for f in os.listdir(first_project_dir) if f.endswith(".pdf")]
        if not pdf_files:
            raise FileNotFoundError(
                f"No PDF files found in '{first_project_dir}' for testing."
            )

        test_doc_path = os.path.join(first_project_dir, pdf_files[0])
        project_def = "an algorithm for first-order gradient-based optimization of stochastic objective functions"

        final_output = run_automatic_pipeline(test_doc_path, project_def)

        print("\n===== Pipeline Complete. Final Output: =====")
        print(json.dumps(final_output, indent=2))

    except Exception as e:
        print(f"\nAn error occurred during the pipeline execution: {e}")

    # Example usage of search and chat
    print("\n===== Running On-demand Search and Chat (Example) =====")
    if "pdf_files" in locals() and pdf_files:
        test_doc_id = os.path.splitext(pdf_files[0])[0] + ".json"

        # Search
        search_query = "What is the main contribution of this paper?"
        print(f"\n--- Searching with query: '{search_query}' ---")
        search_results = run_search(search_query)
        print("Search Results:", search_results)

        # Chat
        chat_query = "Can you explain the methodology in simple terms?"
        print(f"\n--- Chatting with query: '{chat_query}' ---")
        chat_response = run_chat(test_doc_id, chat_query)
        print("Chat Response:", chat_response)
