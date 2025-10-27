# Domain Glossary for what we already have on the board
*(only a suggestion v1)*
![alt text](./images/AI%20LAB%20Domain.jpg)

## Actors

* **User:** AI Practitioner, Researcher. Primary user of the tool. A technical user who explores, designs, and develops AI/ML solutions.
* **New User:** An individual (e.g., another researcher or team member) who accesses the Repository to find and reuse the curated knowledge, evaluation results, and artifacts previously saved by the primary User.

## Core concepts

* **Knowledge Source:** Origin of the information. Contains knowledge artifacts (*like a blog entry, academic publication, documentation, git repo, etc.*)
* **Knowledge Artifact:** A specific piece of knowledge from the Knowledge Source that can be evaluated and reused. (*like a code snippet, a pretrained model, description of an algorithm, etc.*)
* **Source Metadata:** Data describing a Knowledge Source (*like author, publication date, publisher, etc.*)
* **Evaluation Result:** The outcome of the user’s assessment of a Knowledge Artifact or Source, based on a specific Approach. Captures Credibility, Reusability, Relevance, etc.
* **Repository**: Storage or safe for everything (including Knowledge Source or Artifact, Evaluation Result, etc.) for later use.


## Activities

* **Search:** Activity of the User looking for information and solutions to a given AI problem using a search Tool (*Search Engine, LLM, Papers, etc.*)
* **Evaluate:** Process of assessing a Knowledge Source or Artifact based on specific criteria to determine suitability and quality by the user.
* **Labeling:** Process of labeling the knowledge artifact automatically by an "AI" agent
* **Create:** The act of generating a new Knowledge Artifact or Source, such as producing code, or publishing a trained model.
* **Contain:** A relationship indicating that a Knowledge Source includes one or more Knowledge Artifacts.
* **Reuse** (*to be discussed*): Ultimate goal of the process, where the User applies the retained knowledge in their own ML prototype or solution.


## Approaches

* **Search Tool:** The system or interface the user interacts with to find Knowledge Sources. Could be a web search engine, a scholarly literature database, or sth custom.
* **Evaluation Approach:** The method or framework a user applies to evaluate the Knowledge Artifact.
* **Retention Approach:** The method used to save knowledge for later. (*ad-hoc, structured documentation, unstructured notetaking, etc.*)