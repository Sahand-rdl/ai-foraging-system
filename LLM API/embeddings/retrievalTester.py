import os
from documentEmbedder import SemanticSearchEngine

# Config: MUST MATCH ingestor.py
DB_PATH = os.path.join("..", "chroma_db")
engine = SemanticSearchEngine(db_path=DB_PATH)


def test_search():
    print("\n--- Semantic Search ---")
    query = input("Enter your search query: ")

    # Check collection count
    count = engine.collection.count()

    if count == 0:
        print(
            "CRITICAL: The database is empty. Please run ingestor.py successfully first."
        )
        return

    # 1. Fetch more results than we need (e.g., 15) so we can group them
    results = engine.query(query, top_k=15)

    # 2. Aggregation Logic: Keep only the BEST match per unique filename
    unique_docs = {}

    if results["ids"]:
        for i in range(len(results["ids"][0])):
            filename = results["metadatas"][0][i].get("filename", "Unknown")
            score = 1 - results["distances"][0][i]
            text = results["documents"][0][i]

            # If we haven't seen this file yet, OR if this chunk is better than the previous one we found
            if filename not in unique_docs or score > unique_docs[filename]["score"]:
                unique_docs[filename] = {
                    "score": score,
                    "text": text,
                    "filename": filename,
                }

    # 3. Sort the unique documents by their best score
    sorted_docs = sorted(unique_docs.values(), key=lambda x: x["score"], reverse=True)

    print(f"\nFound matches in {len(sorted_docs)} unique documents:\n")

    for i, doc in enumerate(sorted_docs[:5]):  # Show top 5 unique docs
        print(f"Match {i+1} [Highest Similarity: {doc['score']:.4f}]")
        print(f"Document: {doc['filename']}")
        # Clean up text for display
        clean_text = doc["text"].replace("\n", " ").strip()
        print(f"Best Snippet: {clean_text[:250]}...")
        print("-" * 40)


if __name__ == "__main__":
    test_search()
