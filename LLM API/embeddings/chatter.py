import os
import sys
from typing import List, Dict

# --- Path Fix: Ensure sibling 'prompt' and internal 'embedding' folders are visible ---
# This allows importing 'llm_core' from the parent's 'prompt' folder
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)  # This is 'LLM API'
if parent_dir not in sys.path:
    sys.path.append(parent_dir)
if current_dir not in sys.path:
    sys.path.append(current_dir)

# Now we can use absolute-style imports safely from the root of LLM API
from embeddings.documentEmbedder import SemanticSearchEngine
from prompt.llm_core import call_llm


class ScientificAssistant:
    def __init__(self, db_path=None):
        # Default to 'LLM API/chroma_db'
        if db_path is None:
            db_path = os.path.join(parent_dir, "chroma_db")
        self.engine = SemanticSearchEngine(db_path=db_path)

    def ask(self, user_query: str):
        results = self.engine.query(user_query, top_k=5)

        if not results["documents"] or len(results["documents"][0]) == 0:
            return "I couldn't find any relevant information in the library."

        context_blocks = []
        for i in range(len(results["documents"][0])):
            filename = results["metadatas"][0][i].get("filename", "Unknown")
            text = results["documents"][0][i]
            context_blocks.append(f"SOURCE [{filename}]:\n{text}")

        context_string = "\n\n---\n\n".join(context_blocks)

        system_prompt = """
        You are a highly precise Scientific Research Assistant.
        Answer ONLY using the provided context. Cite the source filename.
        Use LaTeX for math (e.g., $E=mc^2$).
        """

        user_prompt = (
            f"CONTEXT:\n{context_string}\n\nQUESTION:\n{user_query}\n\nANSWER:"
        )
        return call_llm(system_prompt, user_prompt)


if __name__ == "__main__":
    assistant = ScientificAssistant()
    print("\n=== AI Paper Assistant Ready ===")
    while True:
        q = input("\nQuestion (or 'exit'): ")
        if q.lower() == "exit":
            break
        print("\nThinking...")
        print(f"\nAI RESPONSE:\n{assistant.ask(q)}\n")
