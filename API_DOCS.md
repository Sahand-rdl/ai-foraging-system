# Data Service API Documentation

Base URL: `http://localhost:8000`

## Overview

This API provides endpoints for managing Projects, Researchers, Knowledge Sources, and Knowledge Artifacts. It also includes AI-powered endpoints for semantic search, summarization, and chat.

---

## 1. Projects

### Get All Projects
- **URL**: `/projects/`
- **Method**: `GET`
- **Query Params**:
    - `skip` (int, default=0): Pagination skip
    - `limit` (int, default=100): Pagination limit
- **Response**: List of `ProjectSchema`

### Get Project by ID
- **URL**: `/projects/{project_id}`
- **Method**: `GET`
- **Path Params**: `project_id` (int)
- **Response**: `ProjectSchema`

### Create Project
- **URL**: `/projects/`
- **Method**: `POST`
- **Body**: `ProjectCreate`
    ```json
    {
      "name": "string",
      "ml_project_definition": "string (optional)",
      "tags": "string (optional)"
    }
    ```
- **Response**: `ProjectSchema`

### Update Project
- **URL**: `/projects/{project_id}`
- **Method**: `PUT`
- **Path Params**: `project_id` (int)
- **Body**: `ProjectCreate`
- **Response**: `ProjectSchema`

### Add Researcher to Project
- **URL**: `/projects/{project_id}/researchers/{researcher_id}`
- **Method**: `POST`
- **Path Params**:
    - `project_id` (int)
    - `researcher_id` (int)
- **Response**: `ProjectSchema`

### Add Knowledge Source to Project
- **URL**: `/projects/{project_id}/knowledge-sources/{ks_id}`
- **Method**: `POST`
- **Path Params**:
    - `project_id` (int)
    - `ks_id` (int)
- **Response**: `ProjectSchema`

### Download and Add Paper to Project
- **URL**: `/projects/{project_id}/download-paper`
- **Method**: `POST`
- **Path Params**: `project_id` (int)
- **Body**: `KnowledgeSourceDownload`
    ```json
    {
      "url": "string (url)",
      "source_metadata": "object (optional)",
      "trustworthiness": "int (optional, 1-3)"
    }
    ```
- **Response**: `KnowledgeSourceSchema`

---

## 2. Researchers

### Get All Researchers
- **URL**: `/researchers/`
- **Method**: `GET`
- **Query Params**: `skip`, `limit`
- **Response**: List of `ResearcherSchema`

### Get Researcher by ID
- **URL**: `/researchers/{researcher_id}`
- **Method**: `GET`
- **Path Params**: `researcher_id` (int)
- **Response**: `ResearcherSchema`

### Create Researcher
- **URL**: `/researchers/`
- **Method**: `POST`
- **Body**: `ResearcherCreate`
    ```json
    {
      "name": "string",
      "email": "string"
    }
    ```
- **Response**: `ResearcherSchema`

---

## 3. Knowledge Sources

### Get All Knowledge Sources
- **URL**: `/knowledge-sources/`
- **Method**: `GET`
- **Query Params**: `skip`, `limit`
- **Response**: List of `KnowledgeSourceSchema`

### Get Knowledge Source by ID
- **URL**: `/knowledge-sources/{ks_id}`
- **Method**: `GET`
- **Path Params**: `ks_id` (int)
- **Response**: `KnowledgeSourceSchema`

### Create Knowledge Source
- **URL**: `/knowledge-sources/`
- **Method**: `POST`
- **Body**: `KnowledgeSourceCreate`
    ```json
    {
      "path": "string",
      "source_metadata": "object (optional)",
      "raw_text": "string (optional)",
      "trustworthiness": "int (optional, 1-3)",
      "is_favourite": "bool (optional, default=false)"
    }
    ```
- **Response**: `KnowledgeSourceSchema`

### Update Knowledge Source
- **URL**: `/knowledge-sources/{ks_id}`
- **Method**: `PUT`
- **Path Params**: `ks_id` (int)
- **Body**: `KnowledgeSourceCreate`
- **Response**: `KnowledgeSourceSchema`

---

## 4. Knowledge Artifacts

### Get All Knowledge Artifacts
- **URL**: `/knowledge-artifacts/`
- **Method**: `GET`
- **Query Params**: `skip`, `limit`
- **Response**: List of `KnowledgeArtifactSchema`

### Get Knowledge Artifact by ID
- **URL**: `/knowledge-artifacts/{artifact_id}`
- **Method**: `GET`
- **Path Params**: `artifact_id` (int)
- **Response**: `KnowledgeArtifactSchema`

### Create Knowledge Artifact
- **URL**: `/knowledge-artifacts/`
- **Method**: `POST`
- **Body**: `KnowledgeArtifactCreate`
    ```json
    {
      "type": "string",
      "title": "string",
      "content": "string (optional)",
      "status": "string (optional, default='suggestion')",
      "tags": "string (optional)",
      "notes": "string (optional)",
      "external_link": "string (optional)",
      "is_bookmarked": "bool (optional, default=false)",
      "chat_history": "object (optional)",
      "knowledge_source_id": "int (required)"
    }
    ```
- **Response**: `KnowledgeArtifactSchema`

### Update Knowledge Artifact
- **URL**: `/knowledge-artifacts/{artifact_id}`
- **Method**: `PUT`
- **Path Params**: `artifact_id` (int)
- **Body**: `KnowledgeArtifactBase` (Same fields as Create, but `knowledge_source_id` is not updatable via this schema usually, though defined in base)
- **Response**: `KnowledgeArtifactSchema`

---

## 5. AI Services

### Semantic Search
- **URL**: `/ai/search`
- **Method**: `POST`
- **Body**:
    ```json
    {
      "query": "string",
      "limit": "int (default=10)",
      "project_id": "int (optional)"
    }
    ```
- **Response**: Search result object (depends on underlying service)

### Extract Artifacts
- **URL**: `/ai/extract-artifacts`
- **Method**: `POST`
- **Body**:
    ```json
    {
      "knowledge_source_id": "int",
      "artifact_types": ["string"] (optional)
    }
    ```
- **Response**: Extraction result

### Chat
- **URL**: `/ai/chat`
- **Method**: `POST`
- **Body**:
    ```json
    {
      "message": "string",
      "knowledge_source_id": "int (optional, enables context awareness)",
      "chat_history": [{"role": "string", "content": "string"}] (optional)
    }
    ```
- **Response**: Chat result

### Summarize
- **URL**: `/ai/summarize`
- **Method**: `POST`
- **Body**:
    ```json
    {
      "knowledge_source_id": "int",
      "max_length": "int (optional)"
    }
    ```
- **Response**: Summary result

### Check Health
- **URL**: `/ai/health`
- **Method**: `GET`
- **Response**:
    ```json
    {
      "semantic_search": "status",
      "llm_service": "status"
    }
    ```

---

## Schemas Reference

### ProjectSchema
```json
{
  "id": "int",
  "name": "string",
  "ml_project_definition": "string",
  "tags": "string",
  "researchers": ["ResearcherSchema"],
  "knowledge_sources": ["KnowledgeSourceBriefSchema"]
}
```

### ResearcherSchema
```json
{
  "id": "int",
  "name": "string",
  "email": "string"
}
```

### KnowledgeSourceSchema
```json
{
  "id": "int",
  "path": "string",
  "source_metadata": "object",
  "raw_text": "string",
  "trustworthiness": "int",
  "is_favourite": "bool",
  "artifacts": ["KnowledgeArtifactSchema"]
}
```

### KnowledgeArtifactSchema
```json
{
  "id": "int",
  "type": "string",
  "title": "string",
  "content": "string",
  "status": "string",
  "tags": "string",
  "notes": "string",
  "external_link": "string",
  "is_bookmarked": "bool",
  "chat_history": "object",
  "knowledge_source_id": "int"
}
```
