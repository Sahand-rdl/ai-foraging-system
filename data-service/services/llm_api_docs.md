# LLM API Specification

This documentation defines the interface for the **LLM API**, a FastAPI service designed for prompt-based document analysis and deep-dive interactions.

**Base URL**: `http://127.0.0.1:8001` (or your configured port)

## Data Models

### Request Schemas

#### ChatRequest
```json
{
  "doc_id": "filename.json",
  "query": "string"
}
```

#### TrustRequest / ExtractRequest
```json
{
  "doc_id": "filename.json"
}
```

#### EvaluateRequest
```json
{
  "doc_id": "filename.json",
  "topic": "string"
}
```

---

## Endpoints

### 1. List Documents
`GET /api/docs`

Returns a list of all available document IDs (filenames) that can be processed.

**Response**:
```json
{
  "documents": ["paper1.json", "paper2.json"]
}
```

### 2. Chat with Document
`POST /api/chat`

Performs a deep-dive query using a scientific assistant context for a specific document.

**Request Body**: `ChatRequest`
**Response**:
```json
{
  "reply": "Extracted answer citing the source..."
}
```

### 3. Check Trustworthiness
`POST /api/trust`

Analyzes the document for metadata and evaluates its trustworthiness using LLM heuristics.

**Request Body**: `TrustRequest`
**Response**:
```json
{
  "metadata": {
    "title": "...",
    "authors": "...",
    "source": "..."
  },
  "trust_result": "Detailed evaluation string..."
}
```

### 4. Extract Information
`POST /api/extract`

Identifies and extracts key entities and sections from the document.

**Request Body**: `ExtractRequest`
**Response**:
```json
{
  "entities": ["List of extracted findings...", "etc."]
}
```

### 5. Evaluate Relevance
`POST /api/evaluate`

Evaluates the importance and relevance of the document content with respect to a specific topic.

**Request Body**: `EvaluateRequest`
**Response**:
```json
{
  "evaluation": "LLM assessment of relevance to the topic..."
}
```

---

## Error Handling
The API returns standard HTTP status codes:
- `200 OK`: Success.
- `404 Not Found`: The specified `doc_id` does not exist in the source folder.
- `422 Unprocessable Entity`: Validation error in the JSON request body.
