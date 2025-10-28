# Domain Glossary for what we already have on the board

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
* **ML problem definition:** A description of the task or challenge the User is trying to solve, which guides their search and evaluation.
* **Search Tool:** The system or interface the user interacts with to find Knowledge Sources. Could be a web search engine, a scholarly literature database, or sth custom.
* **Evaluation Approach:** The method or framework a user applies to evaluate the Knowledge Artifact.

## Activities

* **Search:** Activity of the User looking for information and solutions to a given AI problem using a search Tool (*Search Engine, LLM, Papers, etc.*)
* **Evaluate:** Process of assessing a Knowledge Source or Artifact based on specific criteria to determine suitability and quality by the user.
* **Create:** The act of generating a new Knowledge Artifact or Source, such as producing code, or publishing a trained model.
* **includes:** A relationship indicating that a Knowledge Source includes one or more Knowledge Artifacts.
* **frames:** The relationship showing that the ML problem definition guides the User's work.
* **uses:** The User's action of operating the Search Tool.
* **stores in:** The User's action of saving items into the Repository.
* **accesses:** The act of retrieving data, either by the Search Tool from a Knowledge Source or by a New User from the Repository.
* **has:** The relationship linking a Knowledge Source to its Source Metadata.
* **evaluates:** The relationship showing that a Knowledge Artifact or Source Metadata is assessed by an Evaluation Approach.
