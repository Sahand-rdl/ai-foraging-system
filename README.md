Environment:

- Python 3.11.9
- pip 25.3
- docling 2.64.0

Advice we take from the paper:

1. Targeted Prompt Refinement

Instead of repeatedly sampling with a fixed prompt, we refine prompts based on explicit feedback from prior outputs (e.g., missing content, ambiguity, etc.). Each refinement addresses a specific deficiency observed in the previous iteration.

2. Iterative Pipeline with Feedback Loops

The pipeline is structured as an iterative loop where

- An initial prompt generates a candidate output.
- The output is evaluated against quality criteria (completeness, clarity, etc.).
- Feedback is used to adjust the prompt for the next iteration.

This loop continues until no further significant issues are detected or a maximum iteration count is reached.

3. Separation of Concerns

We separate

- Document preprocessing
- Prompt-based results
- Self-evaluation

This separation improves modularity, debuggability, and reproducibility.

4. Observed Benefits

According to the paper

- Iterative, feedback-driven prompts improve coverage and precision.
- Hallucinations are reduced due to explicit self-assessment constraints.
- The results are more consistent.




JSON FORMAT:

INPUT:
{
    "project_definition": string,
    "path": string  
}
Example:
{ 
    "project_definition": "Project definition",
    "path": "/Users/alex/Documents/AIForaging/papers/raw/1/1706.03762.pdf"
}

    
OUTPUT:

{
    "extracted_path": string,
    "metadata": {
        "title": string,
        "author": string,
        "date": string,
        "abstract": string,
    },
    "trust_result": {
        "trust_level": string,
        "reason": string
    },
    "tags": [
        string,
        string,
        string
    ],
    "relevance": float,
    "knowledge_artifacts": [
        {
            "type": string,
            "title": string,
            "content": string,
            "status": string,
            "tags": string,
            "notes": string,
            "external_link": string,
            "is_bookmarked": boolean,
            "chat_history": string
        }
    ]
}

Example:
{
    "extracted_path": "/Users/alex/Documents/AIForaging/papers/extracted/1/1706.03762.json",
    "metadata": {
        "title": "Title",
        "author": "Author",
        "date": "Date",
        "abstract": "Abstract",
    },
    "trust_result": {
        "trust_level": "High | Medium | Low",
        "reason": "Reason for trust level"
    },
    "tags": [
        "Tag1",
        "Tag2",
        "Tag3"
    ],
    "relevance": 0.95,
    "knowledge_artifacts": [
        {
            "type": "type",
            "title": "title",
            "content": "content",
            "status": "status",
            "tags": "tags",
            "notes": "notes",
            "external_link": "external_link",
            "is_bookmarked": "is_bookmarked",
            "chat_history": "chat_history"
        }
    ]
}
