import { KnowledgeSourcesView } from "@/components/sources";
// TODO: Replace mock data import with API call:
// - fetchKnowledgeSources() for mockKnowledgeSources
// import { fetchKnowledgeSources } from "@/services/api";
import { mockKnowledgeSources } from "@/types/source";

export default function KnowledgeSources() {
  return (
    <div className="h-[calc(100vh-3rem)]">
      <KnowledgeSourcesView
        sources={mockKnowledgeSources}
        title="All Knowledge Sources"
        description="Manage and analyze your knowledge sources across all projects"
        getSourceTitle={(source) => source.metadata.title || `Source #${source.id}`}
      />
    </div>
  );
}
