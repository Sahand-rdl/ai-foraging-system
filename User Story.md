## Activities

1. As an Engineer, I want to frame an ML Problem Definition, so that I have a clear understanding of the goal.
2. As an Engineer, I want to use the Search Tool, so that I can look for Knowledge Sources related to my ML Problem Definition.
3. As an Engineer, I want to select a Knowledge Source and apply a chosen Evaluation Approach, so that I can create an Evaluation Result.
4. As an AI Agent, I want to evaluate the Knowledge Source, Knowledge Artifact, and Source Metadata, so that I can create an Evaluation Result.
5. As an Engineer, I want to store the relevant Knowledge Artifact, Source Metadata and Evaluation Result to the Knowledge Repository, so that I and an Explorer can reuse it in the future.
6. As an Explorer, I want to access and search the Knowledge Repository using keywords or problem descriptions, so that I can find existing Knowledge Artifacts and Evaluation Results relevant to my task.

Additional notes : The Engineer can give like 5 stars and a free text as an evaluation. 
AI Agent should give back the Knowledge Source with highlighted parts that is relevant to the ML Problem
Engineer can feed AI Agent multiple Knowledge Sources, and the AI Agent should give the Engineer back which Knowledge Sources are good/bad



#  Key Activities

1. Problem Definition
2. Knowledge discovery (outsourced to f.e. google scholar)
3. Evaluation
    1. metadata eval (is the abstract worth skimming?)
        * manual gut feeling check
        * automated paper quality and relevance score (?)
    2. knowledge source eval
        * actually read the abstract if needed and decide if knowledge source is good (optional)
        * submit knowledge source to agent if yes (as a pdf/text file)
(this is where it gets important)
4. extraction of relevant knowledge artifacts
    1. let agent go over knowledge source and let it find & tag relevant KA (according to Problem definition)
    2. manually skim tagged parts and decide if the KA are actually relevant
    3. actually read & understand the knowledge source
5. creation & upkeep of Knowledge Repository
    * store a curated selection of KAs with metadata and context around their usefulness
6. Reuse of Repo by Explorers
	* clear idea of repo content through set project definition 
	* easy onboarding through curated & searchable knowledge artifacts
	* straight-forward extraction of relevant KAs through extensive tagging 

## User Stories


### 1. Evaluation



-   As an **Engineer**, I want to **quickly review source metadata** (like author or abstract) so that I can **decide if it's worth a deeper look**. ()
    
-   As an **Engineer**, I want to **record my evaluation result** (e.g., "highly relevant") for a source so that **I and others know its value**.
    

### 2. Knowledge Extraction

-   As an **Engineer**, I want an **agent to scan a knowledge source** so that it can **highlight potential knowledge artifacts** related to my problem.
    
-   As an **Engineer**, I want to **review the highlighted artifacts** so that I can **confirm their relevance and usefulness**.
    

### 3. Knowledge Repository

-   As an **Engineer**, I want to **state my ML problem** so that Explorers can quickly understand the ML problem that is covered by the project
    
-   As an **Engineer**, I want to group **Knowledge Artifacts** by project, so that I have an overview of all relevant Information.

-   As an *Engineer**, I want to Invite other Engineers to the Project, so that we can work on it collaberatively.

-   As an **Engineer**, I want to **save a useful Knowledge Artifact** with my notes and tags so that **it can be reused by my team of Explorers**.

-   As an **Explorer**, I want to **search the repository** using keywords so that I can **find curated artifacts for my own task**.
    
-   As an **Explorer**, I want to **see the saved evaluation results** for an artifact so that I can **quickly understand _why_ it was considered valuable**.