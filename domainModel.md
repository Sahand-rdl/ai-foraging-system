---
config:
  layout: elk
---
classDiagram
direction BT
    class User {
    }
    class NewUser {
    }
    class MLProblemDefinition {
	    +problemId: UUID
	    +title: string
	    +description: text
    }
    class KnowledgeSource {
	    +sourceId: UUID
	    +name: string
	    +type: SourceType   // paper, dataset, repo, blog, ...
	    +accessUrl: URI
    }
    class KnowledgeArtifact {
	    +artifactType: ArtifactType
    }
    class Repository {
	    retentionApproach: Retentionapproach
    }
    class RetentionAppraoch {
	    adHocBookmarking
	    unstructuredNotes
	    structuredNotes
    }
    class ArtifactType {
	    declarative
	    procedural
	    executable
    }
    class EvaluationApproach {
	    +method: string
	    +metrics: string[]
	    +createdAt: datetime
    }
    class EvaluationResult {
    }
    class SearchTool {
	    type
    }
    class SourceMetadata {
    }

	<<interface>> RetentionAppraoch
	<<interface>> ArtifactType

    User "1" --> "0..*" MLProblemDefinition : frames
    User "1" --> "0..*" SearchTool : uses
    SearchTool "1" --> "0..*" KnowledgeSource : accesses
    KnowledgeSource "1" --> "1" SourceMetadata : has
    KnowledgeSource "1" --> "0..*" KnowledgeArtifact : includes
    User "1" --> "0..*" EvaluationApproach : creates
    EvaluationApproach "1" --> "1..*" KnowledgeArtifact : evaluates
    User "1" --> "0..*" EvaluationResult : creates
    EvaluationResult "1" --> "1..*" KnowledgeArtifact : evaluates
    EvaluationResult "0..*" --> "1" EvaluationApproach : producedBy
    User "1" --> "0..*" Repository : storesIn
    Repository "1" o-- "0..*" KnowledgeArtifact : contains
    Repository "1" o-- "0..*" EvaluationResult : contains
    NewUser "1" --> "0..*" Repository : accesses
