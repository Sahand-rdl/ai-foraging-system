#  Subdomains

---

##  <span style="color:#ff6600">Subdomain 1: Problem Definition</span>

**Story 1.1**  
**As an Engineer**, I want to **create a structured ML problem definition**, 
so that the system can understand what kind of ML problem I’m trying to solve.

**Input:** Natural language description of the ML problem.  
**System Tasks:**
1. Use LLMs to extract structured attributes.  
2. Generate a standardized **Problem Definition**.  
**Output:** `Problem_Definition` object.

---

##  <span style="color:#007acc">Subdomain 2: Knowledge Discovery</span>

**Story 2.1**  
**As an Engineer**, I want to **search for Knowledge Sources** related to my ML Problem, 
so that I can find potentially useful research papers, codebases, or datasets.

**Input:** `Problem_Definition`.  
**System Tasks:**
1. Call external or internal search APIs.  
2. Perform **keyword and semantic matching**.  
**Output:** List of **Knowledge Sources** with metadata *(title, abstract, link, tags, etc.)*.

---

**Story 2.2**  
**As an Engineer**, I want to **select one or more Knowledge Sources**, 
so that I can send them for evaluation.

**Input:** Selected `Source_IDs` + `Problem_ID`.  
**Output:** Collection of sources to be evaluated.

---

**Story 2.3**  
**As an Engineer**, I want to **choose an Evaluation Approach**, 
so that the system knows how to process the selected Knowledge Sources.

**Input:** Collection of evaluation approaches.  
**Output:** An `Evaluation_Approach`.

---

##  <span style="color:#28a745">Subdomain 3: AI Evaluation</span>

**Story 3.1**  
**As an AI Agent**, I want to **analyze the Knowledge Source content and metadata**, 
so that I can determine how relevant it is to the given ML Problem.

**Input:** `Problem_Definition` + Knowledge Source content.  
**System Tasks:**
1. Perform **semantic similarity matching**.  
2. Extract and highlight the most relevant sentences.  
3. Summarize reasoning and generate a **“Good/Bad” decision**.  
**Output:** AI-generated `Evaluation_Result`.

---

**Story 3.2**  
**As an AI Agent**, I want to **highlight the parts of the Knowledge Source** that are relevant to the ML Problem,  
so that the Engineer can focus on the most useful sections.

**Input:** AI-generated `Evaluation_Result`.  
**System Tasks:**
1. Highlight relevant parts of the Knowledge Source.  
**Output:** AI-generated `Evaluation_Result` **with highlighted notes**.

---

**Story 3.3**  
**As an Engineer**, I want to **review the AI Agent’s evaluation** and **add my own feedback**,  
so that I can refine the evaluation with a star rating and free-text comment.

**Input:** AI-generated `Evaluation_Result` with highlights.  
**Output:** AI-generated `Evaluation_Result` **with highlights and evaluations**.

---

##  <span style="color:#8a2be2">Subdomain 4: Knowledge Repository</span>

**Story 4.1**  
**As an Engineer**, I want to **store the Knowledge Source, its metadata, and the Evaluation Result**,  
so that it can be reused and referenced in the future.

**Input:** Knowledge Source + Evaluation Result + Problem Definition.  
**System Tasks:**
1. Save data in the repository.  
2. Generate **searchable indexes**.  
**Output:** Searchable `Knowledge_Artifact`.

---

**Story 4.2**  
**As an Explorer**, I want to **search the Knowledge Repository by keywords or problem descriptions**,  
so that I can find related Knowledge Artifacts and Evaluation Results.

**Input:** Keywords or problem descriptions.  
**System Tasks:**
1. Support **keyword and semantic search**.  
2. Retrieve related problems, sources, and evaluations.  
**Output:** Related `Knowledge_Artifact`.

---

**Story 4.3**  
**As an Explorer**, I want to **view historical evaluations**,  
so that I can assess the reliability and usefulness of each artifact.

**Input:** `Knowledge_Artifact`.  
**System Tasks:**
1. Retrieve **historical evaluations**.  
**Output:** Historical evaluations