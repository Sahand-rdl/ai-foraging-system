import os
import sys
import json
from typing import List, Dict

# --- Path Fix ---
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)  # This is 'LLM API'
if parent_dir not in sys.path:
    sys.path.append(parent_dir)
if current_dir not in sys.path:
    sys.path.append(current_dir)

from prompt.llm_core import call_llm
from config import PROCESSED_DOCS_DIR


class ScientificAssistant:
    def __init__(self):
        # Use the centralized path for processed documents
        self.json_folder = PROCESSED_DOCS_DIR
        self.active_doc = None

    def set_active_document(self, filename: str):
        """Sets the specific paper to chat with."""
        self.active_doc = filename

    def _get_full_doc_text(self, filename: str) -> str:
        """Loads the entire text content from the docling JSON."""
        path = os.path.join(self.json_folder, filename)
        if not os.path.exists(path):
            return ""
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            content_list = data.get("texts", []) or data.get("content", [])
            full_text = " ".join(
                [
                    item.get("text", "")
                    for item in content_list
                    if isinstance(item, dict)
                ]
            )
            return full_text[:120000]
        except Exception as e:
            return f"Error reading document: {e}"

    def ask(self, user_query: str):
        """
        Executes a deep-dive query on the currently active document.
        """
        if not self.active_doc:
            return "No document selected. Please select a document first."

        full_text = self._get_full_doc_text(self.active_doc)
        if not full_text:
            return f"Error: Could not load text for {self.active_doc}."

        system_prompt = f"""
        You are a technical specialist for the research paper: {self.active_doc}.
        Search the provided FULL TEXT thoroughly, including footnotes, URLs, and references.
        
        Rules:
        - Provide a concise, factual response (max 3-4 sentences).
        - If a GitHub repository or URL is mentioned, provide it explicitly.
        - Cite the source as [{self.active_doc}].
        - Use LaTeX for mathematical formulas.
        - If the information is not in the text, say: 'Not found in {self.active_doc}.'
        - Do NOT use markdown tables or headers like 'Summary'.
        """

        user_prompt = (
            f"PAPER CONTENT:\n{full_text}\n\n"
            f"USER QUERY: {user_query}\n\n"
            f"RESPONSE:"
        )

        return call_llm(system_prompt, user_prompt)

    def list_documents(self) -> List[str]:
        """Returns a list of JSON filenames from the docling folder."""
        if not os.path.exists(self.json_folder):
            return []
        return sorted([f for f in os.listdir(self.json_folder) if f.endswith(".json")])


if __name__ == "__main__":
    assistant = ScientificAssistant()
    docs = assistant.list_documents()

    print("\n=== Scientific Knowledge Assistant (Deep-Dive Mode) ===")

    if not docs:
        print(f"Error: No documents found in {assistant.json_folder}")
        sys.exit(1)

    print("\nAvailable Documents:")
    for idx, d in enumerate(docs):
        print(f"[{idx}] {d}")

    # Selection Loop
    while True:
        choice = input(
            "\nSelect a document ID to start chatting (or type 'exit' to quit): "
        )

        if choice.lower() in ["exit", "quit"]:
            print("Goodbye!")
            sys.exit(0)

        try:
            doc_idx = int(choice)
            selected_doc = docs[doc_idx]
            assistant.set_active_document(selected_doc)
            print(f"--- Chatting with: {selected_doc} ---")
            break
        except (ValueError, IndexError):
            print("Invalid ID. Please choose a number from the list or type 'exit'.")

    # Chat Loop
    while True:
        q = input(f"\n[{assistant.active_doc}] Q: ")
        if q.lower() in ["exit", "quit"]:
            print("Exiting chat...")
            break

        print("Analyzing document...")
        response = assistant.ask(q)
        print(f"\nA: {response}\n")
