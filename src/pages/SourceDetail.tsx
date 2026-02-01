import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

import { 
  fetchKnowledgeSourceById, 
  fetchKnowledgeArtifactsBySourceId,
  updateArtifactStatus,
  updateArtifactBookmark,
  addArtifactTag,
  removeArtifactTag,
  updateArtifactNotes,
  updateArtifactContent,
  updateArtifactExternalLink,
  sendChatMessageToSource,
  deleteArtifact,
  API_BASE_URL,
  type ChatResponse
} from "@/services/api";

import { 
  type KnowledgeSource, 
  type KnowledgeArtifact, 
  type KAType,
  type ChatMessage as KAChatMessage
} from "@/types/source";

// Components
import { PDFPreview, type PDFPreviewRef } from "@/components/source-detail/PDFPreview";
import { ArtifactList } from "@/components/source-detail/ArtifactList";
import { ArtifactDetail } from "@/components/source-detail/ArtifactDetail";

export default function SourceDetail() {
  const { id, projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const aidParam = searchParams.get("aid");
  const searchParam = searchParams.get("search");
  
  const [source, setSource] = useState<KnowledgeSource | null>(null);
  const [artifacts, setArtifacts] = useState<KnowledgeArtifact[]>([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [selectedFilter, setSelectedFilter] = useState<KAType | "all">("all");
  const [selectedArtifactId, setSelectedArtifactId] = useState<number | null>(null);
  
  // Local state for chat input/tag input
  const [currentMessage, setCurrentMessage] = useState("");
  const [newTag, setNewTag] = useState("");
  const [previewSearchQuery, setPreviewSearchQuery] = useState(""); // Still used for initial artifact search

  const pdfPreviewRef = useRef<PDFPreviewRef>(null); // Ref for PDFPreview component

  useEffect(() => {
    async function loadData() {
        if (!id) return;
        const sourceId = parseInt(id, 10);
        try {
            const [sourceData, artifactsData] = await Promise.all([
                fetchKnowledgeSourceById(sourceId),
                fetchKnowledgeArtifactsBySourceId(sourceId)
            ]);
            setSource(sourceData || null);
            setArtifacts(artifactsData);
            
            // Handle deep link to artifact
            if (aidParam) {
                const aid = parseInt(aidParam, 10);
                if (!isNaN(aid)) {
                    setSelectedArtifactId(aid);
                    // Also trigger search in preview
                    const linkedArtifact = artifactsData.find(a => a.id === aid);
                    if (linkedArtifact) {
                        setPreviewSearchQuery(linkedArtifact.title);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load source details", error);
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, [id, aidParam]);

  useEffect(() => {
    if (searchParam) {
      setPreviewSearchQuery(searchParam);
    }
  }, [searchParam]);

  const filteredArtifacts = selectedFilter === "all" 
    ? artifacts 
    : artifacts.filter(a => a.type === selectedFilter);

  const selectedArtifact = artifacts.find(a => a.id === selectedArtifactId);

  const handleArtifactSelect = (id: number) => {
    setSelectedArtifactId(id);
    setSearchParams({ aid: id.toString() });
    const artifact = artifacts.find(a => a.id === id);
    if (artifact) {
      setPreviewSearchQuery(artifact.title);
    }
  };

  // Mutations
  const handleStatusChange = async (artifactId: number, status: "suggestion" | "final") => {
    try {
        const updated = await updateArtifactStatus(artifactId, status);
        setArtifacts(prev => prev.map(a => a.id === artifactId ? updated : a));
    } catch (e) { console.error(e); }
  };

  const toggleFavorite = async (artifactId: number) => {
    const artifact = artifacts.find(a => a.id === artifactId);
    if (!artifact) return;
    try {
        const updated = await updateArtifactBookmark(artifactId, !artifact.isBookmarked);
        setArtifacts(prev => prev.map(a => a.id === artifactId ? updated : a));
    } catch (e) { console.error(e); }
  };

  const handleAddTag = async (artifactId: number, tag: string) => {
    if (!tag.trim()) return;
    try {
        const updated = await addArtifactTag(artifactId, tag);
        setArtifacts(prev => prev.map(a => a.id === artifactId ? updated : a));
        setNewTag("");
    } catch (e) { console.error(e); }
  };

  const handleRemoveTag = async (artifactId: number, tag: string) => {
    try {
        const updated = await removeArtifactTag(artifactId, tag);
        setArtifacts(prev => prev.map(a => a.id === artifactId ? updated : a));
    } catch (e) { console.error(e); }
  };

  const handleUpdateNotes = async (artifactId: number, notes: string) => {
    // Optimistic update for text area responsiveness
    setArtifacts(prev => prev.map(a => a.id === artifactId ? { ...a, notes } : a));
    try {
        await updateArtifactNotes(artifactId, notes);
    } catch (e) { console.error(e); }
  };

  const handleUpdateContent = async (artifactId: number, content: string) => {
    setArtifacts(prev => prev.map(a => a.id === artifactId ? { ...a, content } : a));
    try {
        await updateArtifactContent(artifactId, content);
    } catch (e) { console.error(e); }
  };

  const handleUpdateExternalLink = async (artifactId: number, link: string) => {
    setArtifacts(prev => prev.map(a => a.id === artifactId ? { ...a, externalLink: link } : a));
    try {
        await updateArtifactExternalLink(artifactId, link);
    } catch (e) { console.error(e); }
  };

  const handleSendChatMessage = async (artifactId: number) => {
    if (!currentMessage.trim() || !source) return; // Guard clause
    
    const userMsg: KAChatMessage = {
        role: "user",
        content: currentMessage,
        timestamp: new Date().toISOString()
    };

    // Optimistically update the UI for the specific artifact
    setArtifacts(prev => prev.map(a => 
        a.id === artifactId ? { ...a, chatHistory: [...a.chatHistory, userMsg] } : a
    ));
    setCurrentMessage("");

    try {
        // Correctly call the API with the SOURCE ID (doc_id) and the message
        const response = await sendChatMessageToSource(source.id, userMsg.content);
        
        // Update the artifact's chat history with the assistant's response
        setArtifacts(prev => prev.map(a => 
            a.id === artifactId ? { ...a, chatHistory: [...a.chatHistory, response.assistantMessage] } : a
        ));
    } catch (e) { 
        console.error("Failed to send chat message:", e);
        // Optional: Revert optimistic update on error
    }
  };

  // Accept a suggestion (mark as final)
  const handleAccept = async (artifactId: number) => {
    try {
      const updated = await updateArtifactStatus(artifactId, "final");
      setArtifacts(prev => prev.map(a => a.id === artifactId ? updated : a));
    } catch (e) { console.error(e); }
  };

  // Decline a suggestion (delete it)
  const handleDecline = async (artifactId: number) => {
    try {
      await deleteArtifact(artifactId);
      setArtifacts(prev => prev.filter(a => a.id !== artifactId));
    } catch (e) { console.error(e); }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      terminology: "default",
      figure: "secondary",
      algorithm: "outline",
      table: "secondary"
    };
    return colors[type as keyof typeof colors] || "outline";
  };
  
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!source) return <div className="h-screen flex items-center justify-center">Source not found</div>;

  // Use source.path if available, and if it's not a web URL, use the content endpoint.
  let pdfUrl = "";
  if (source.path) {
      if (source.path.startsWith("http")) {
          pdfUrl = source.path;
      } else {
          // It's a local path, so we stream via backend endpoint
          pdfUrl = `${API_BASE_URL}/knowledge-sources/${source.id}/content`;
      }
  } else if (source.metadata.url) {
      pdfUrl = source.metadata.url;
  }

  const handleBack = () => {
    if (pdfPreviewRef.current) {
        pdfPreviewRef.current.clearSearch(); // Clear search using ref
    }
    setPreviewSearchQuery(""); // Clear the search query state (also used for initial externalSearchQuery)
    if (projectId) {
        navigate(`/projects/${projectId}`);
    } else {
        navigate("/sources");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* PDF Viewer */}
        <ResizablePanel defaultSize={60} minSize={30}>
          <PDFPreview ref={pdfPreviewRef} pdfUrl={pdfUrl} onBack={handleBack} externalSearchQuery={previewSearchQuery} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* AI Extraction Sidebar */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full border-l border-border bg-card flex flex-col">
            
            {/* Show detailed view if an artifact is selected, otherwise show list */}
            {selectedArtifactId && selectedArtifact ? (
              <ArtifactDetail 
                artifact={selectedArtifact}
                getTypeColor={getTypeColor}
                onBack={() => {
                    setSelectedArtifactId(null);
                    setSearchParams({});
                }}
                onToggleFavorite={toggleFavorite}
                onStatusChange={handleStatusChange}
                onRemoveTag={handleRemoveTag}
                onAddTag={handleAddTag}
                onUpdateNotes={handleUpdateNotes}
                onSendChatMessage={handleSendChatMessage}
                currentMessage={currentMessage}
                onMessageChange={setCurrentMessage}
                newTag={newTag}
                onNewTagChange={setNewTag}
                onUpdateContent={handleUpdateContent}
                onUpdateExternalLink={handleUpdateExternalLink}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            ) : (
              <ArtifactList 
                artifacts={filteredArtifacts}
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
                onArtifactSelect={handleArtifactSelect}
                getTypeColor={getTypeColor}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}