# 🧠 Artifaix: AI-Powered Research Artifact Extraction

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-000000?style=for-the-badge&logo=chroma&logoColor=white)](https://www.trychroma.com/)

**Artifaix** is a professional-grade research platform designed to optimize the process of gathering and reusing knowledge from scientific literature. Developed at **RWTH Aachen**, the name is a tribute to our core focus and our city: a fusion of **Artifacts** (the heart of our system), **AI** (our engine), and **AIX** (the historical name for Aachen). It helps ML researchers and engineers filter out noise and extract high-value **Knowledge Artifacts** (Algorithms, Code, Terminology) into a curated, searchable repository.

---

## 🚀 The Core Vision: Scaling Research
In the status quo, researchers face information overload. **Artifaix** addresses this by automating the "Search, Evaluate, and Retain" loop:

- **AI-Driven Evaluation**: Automatically filters out low-quality sources based on project-specific ML problem definitions.
- **Precision Extraction**: Uses specialized agents to find "Declarative" (Algos), "Procedural" (Patterns), and "Executable" (Code) artifacts.
- **Collaborative Repository**: A centralized hub where team "Explorers" can reuse curated knowledge without re-reading entire papers.

---

## 🛠️ Advanced Intelligence Pipeline
The system leverages state-of-the-art NLP techniques to handle complex academic documents:

### 📄 Smart Document Processing
- **MapReduce Strategy**: Large papers are split into chunks, processed in parallel, and reduced into a clean, deduplicated knowledge graph.
- **Docling Integration**: High-fidelity structural parsing of PDFs, images, and HTML into unified JSON representations.
- **Metadata Enrichment**: Integrates with the **OpenAlex API** to verify and enrich bibliographic data (citations, DOIs, and venues).

### 🤖 LLM-Assisted Reasoning
- **Persona-Based Agents**: Specialized personas (Academic Reviewer, Technical Specialist) drive the extraction logic.
- **Iterative Feedback Loops**: Each extraction is self-assessed for completeness and hallucinations, refining the prompt until the output is optimal.
- **Trust Checker**: A dedicated agent that cross-references extracted metadata with document content to ensure data integrity.

### 🔍 Semantic Search (RAG)
- **Embedding Model**: `BAAI/bge-small-en-v1.5` (optimized for semantic similarity).
- **Vector Storage**: ChromaDB (local-first, python-native) for instant retrieval.
- **Retrieval-Augmented Generation**: Direct chat with your knowledge base using the `gpt-oss-120b` model (hosted on RWTH Aachen HPC).

---

## 🧱 Software Architecture
Built with a modular, microservice-first approach for maximum flexibility.

- **Frontend**: React + TypeScript + shadcn/ui.
- **Data Service**: FastAPI + SQLite (Relational metadata tracking, inspired by Zotero).
- **LLM API**: Specialized endpoints for Chatter, Extraction, and Trust Checking.
- **Knowledge Manager**: Handles TF-IDF calculation and semantic indexing.

---

## 🗺️ System Walkthrough: A Guided Tour

This repository is organized as a modular microservice ecosystem. Each component plays a specific role in the information foraging lifecycle:

### 1. [📡 Data Service](./data-service) (The Central Nervous System)
The backbone of the system. It manages the relational state, project hierarchies, and coordinates between the UI and the intelligence layer.
*   **Key Tech**: FastAPI, SQLAlchemy, SQLite.
*   **Focus**: Domain-driven design, CRUD operations, and service orchestration.

### 2. [🤖 LLM Service](./llm-service) (The Intelligence Layer)
Where the heavy lifting happens. This service handles PDF parsing, semantic embedding, and iterative AI reasoning.
*   **Key Tech**: ChromaDB, Docling, OpenAI-compatible APIs.
*   **Focus**: RAG pipelines, MapReduce document processing, and self-evaluating AI agents.

### 3. [💻 Frontend](./frontend) (The User Experience)
A modern, responsive dashboard where researchers manage their projects and interact with their curated knowledge.
*   **Key Tech**: React, TypeScript, Tailwind CSS, shadcn/ui.
*   **Focus**: Clean data visualization and interactive AI chat interfaces.

---

## 🛠️ CLI & Research Utilities
Beyond the web interface, the `llm-service/LLM API` contains specialized scripts for deep research:

- **`tfidf.py`**: Performs keyword analysis to identify distinctive terms in documents compared to the rest of the repository.
- **`prompt_test.py`**: An interactive CLI for testing Trust Checking, Entity Extraction, and Relevance Evaluation on specific documents.
- **`prompt_batch_extract.py`**: Automates the full extraction pipeline across all processed documents with iterative self-assessment.
- **`llm_list.py`**: Utility to list and verify available models on the HPC cluster.

---

## 🚦 Getting Started

### 1. Environment Setup
You'll need **Python 3.11+** and **Node.js**.

```bash
# Clone the repository
git clone https://github.com/Sahand-rdl/Artifaix.git
cd Artifaix
```

### 2. Configure Secrets
Copy the template `.env` files and add your API keys:
- `data-service/.env.example` -> `data-service/.env`
- `llm-service/.env.example` -> `llm-service/.env`

> **Note on Storage**: On the first run, the system automatically creates a storage directory at `~/Documents/AIForaging/papers` (configured in `.env`). This pathing supports macOS and Linux; for Windows users, please update the `PAPERS_STORAGE_PATH` in `.env` to a valid Windows path.

### 3. Master Launch Script
```bash
chmod +x start_services.sh
./start_services.sh
```
*Access the Frontend at `http://localhost:8080`.*

---

## 📜 Academic References & Acknowledgments
This project was developed at the **RWTH Aachen University** (Software Construction Lab) under the supervision of **Selin Coban**.

- **MapReduce Implementation**: Inspired by Dean & Ghemawat (2008).
- **LLM Infrastructure**: Supported by the HPC Aachen `gpt-oss` cluster.
- **Semantic Engine**: Powered by BAAI's `bge-small` and ChromaDB.

---

*Transforming information into insight, one artifact at a time.*
