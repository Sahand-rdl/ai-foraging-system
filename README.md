Environment:

Python 3.11.9

pip 25.3

docling 2.64.0

Advice we take from the paper:

1. Targeted Prompt Refinement

Instead of repeatedly sampling with a fixed prompt, we refining prompts based on
explicit feedback from prior outputs (e.g., missing content, ambiguity, etc.). Each refinement addresses a specific deficiency observed in the previous iteration.

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