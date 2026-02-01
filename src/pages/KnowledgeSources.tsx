import { useEffect, useState } from "react";
import { KnowledgeSourcesView } from "@/components/sources";
import { fetchKnowledgeSources } from "@/services/api";
import { type KnowledgeSource } from "@/types/source";

export default function KnowledgeSources() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchKnowledgeSources();
        setSources(data);
      } catch (error) {
        console.error("Failed to load knowledge sources", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading sources...</div>;
  }

  return (
    <div className="h-[calc(100vh-3rem)]">
      <KnowledgeSourcesView
        sources={sources}
        title="All Knowledge Sources"
        description="Manage and analyze your knowledge sources across all projects"
        getSourceTitle={(source) => source.metadata.title || `Source #${source.id}`}
        showRelevance={false} // Hide relevance column for global view
      />
    </div>
  );
}