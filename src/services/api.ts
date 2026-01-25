/**
 * API Service Layer
 * 
 * This file contains HTTP request functions for all data operations.
 */

import {
  type Project,
  type Researcher,
  type KnowledgeSource,
  type KnowledgeArtifact,
  type ChatMessage,
} from "@/types/source";

// =============================================================================
// Configuration
// =============================================================================

export const API_BASE_URL = "http://localhost:8000";

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  return response.json();
}

/**
 * Mappers to transform backend snake_case to frontend camelCase
 * and handle data type differences (like tags string <-> array)
 */

interface BackendProject {
  id: number;
  name: string;
  ml_project_definition?: string;
  tags?: string;
  researchers?: BackendResearcher[];
  knowledge_sources?: BackendKnowledgeSource[];
}

interface BackendResearcher {
  id: number;
  name: string;
  email: string;
}

interface BackendKnowledgeSource {
  id: number;
  path: string;
  source_metadata?: any;
  raw_text?: string;
  trustworthiness?: number;
  is_favourite?: boolean;
  artifacts?: BackendKnowledgeArtifact[];
  project_id?: number;
}

interface BackendKnowledgeArtifact {
  id: number;
  type: string;
  title: string;
  content?: string;
  status?: "suggestion" | "final";
  tags?: string;
  notes?: string;
  external_link?: string;
  is_bookmarked?: boolean;
  chat_history?: any;
  knowledge_source_id: number;
}

// Validation / Type Guard helpers could be added here if needed, 
// for now we trust the backend returns proper structure but mapping is needed.

function mapResearcher(r: BackendResearcher): Researcher {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
  };
}

function mapProject(p: BackendProject): Project {
  return {
    id: p.id,
    name: p.name,
    mlProjectDefinition: p.ml_project_definition || "",
    // Backend returns objects, frontend expects IDs list for relationships currently
    // or maybe we should update frontend to use objects? 
    // Types in source.ts say:
    // knowledgeSourceIds: number[]; 
    // researcherIds: number[]; 
    // But backend returns full objects potentially? 
    // Let's check backend endpoint again. 
    // Backend endpoint says:
    // "researchers": ["ResearcherSchema"],
    // "knowledge_sources": ["KnowledgeSourceBriefSchema"]
    // So we map them to IDs to match current frontend type definitions.
    researcherIds: p.researchers?.map(r => r.id) || [],
    knowledgeSourceIds: p.knowledge_sources?.map(ks => ks.id) || [],
    tags: p.tags ? p.tags.split(",").map(t => t.trim()) : [],
  };
}

function mapKnowledgeSource(ks: BackendKnowledgeSource): KnowledgeSource {
  // Map trustworthiness int to string enum
  let trust: "High" | "Medium" | "Low" = "Medium";
  if (ks.trustworthiness === 3) trust = "High";
  else if (ks.trustworthiness === 1) trust = "Low";

  return {
    id: ks.id,
    metadata: ks.source_metadata || {},
    rawText: ks.raw_text || "",
    knowledgeArtifactIds: ks.artifacts?.map(a => a.id) || [],
    trustworthiness: trust,
    projectId: ks.project_id || 0, // Backend might not send projectId if fetched via project endpoint?
    isFavourite: ks.is_favourite || false,
    path: ks.path,
  };
}

function mapKnowledgeArtifact(ka: BackendKnowledgeArtifact): KnowledgeArtifact {
  return {
    id: ka.id,
    type: ka.type as any, // Cast to generic or specific KAType if strictly verified
    title: ka.title,
    content: ka.content || "",
    status: ka.status || "suggestion",
    tags: ka.tags ? ka.tags.split(",").map(t => t.trim()) : [],
    notes: ka.notes || "",
    knowledgeSourceId: ka.knowledge_source_id,
    externalLink: ka.external_link,
    isBookmarked: ka.is_bookmarked || false,
    chatHistory: ka.chat_history || [],
  };
}


// =============================================================================
// READ Operations - Projects
// =============================================================================

export async function fetchProjects(): Promise<Project[]> {
  const backendProjects = await apiRequest<BackendProject[]>("/projects/");
  return backendProjects.map(mapProject);
}

export async function fetchProjectById(id: number): Promise<Project | undefined> {
  try {
    const p = await apiRequest<BackendProject>(`/projects/${id}`);
    return mapProject(p);
  } catch (e) {
    console.error(`Failed to fetch project ${id}`, e);
    return undefined;
  }
}

// =============================================================================
// READ Operations - Researchers
// =============================================================================

export async function fetchResearchers(): Promise<Researcher[]> {
  const researchers = await apiRequest<BackendResearcher[]>("/researchers/");
  return researchers.map(mapResearcher);
}

export async function fetchResearchersByIds(ids: number[]): Promise<Researcher[]> {
  // Not directly supported by backend as a batch endpoint based on known endpoints.
  // We can fetch all and filter (inefficient but works for small sets) or simple loop.
  // Given the backend endpoints doc doesn't show a bulk get.
  // Let's fetch all for now or check if we even need this if project has researchers embedded.
  // Actually, project usually needs to show researchers.
  // If ids list is small, we can fetch individual or fetch all.
  const all = await fetchResearchers();
  return all.filter(r => ids.includes(r.id));
}

// =============================================================================
// READ Operations - Knowledge Sources
// =============================================================================

export async function fetchKnowledgeSources(): Promise<KnowledgeSource[]> {
  const sources = await apiRequest<BackendKnowledgeSource[]>("/knowledge-sources/");
  return sources.map(mapKnowledgeSource);
}

export async function fetchKnowledgeSourcesByProjectId(
  projectId: number
): Promise<KnowledgeSource[]> {
  // Backend doesn't seem to have ?projectId= filter on /knowledge-sources based on docs.
  // But Project detail has knowledge_sources embedded.
  // Or we can assume there might be a filter?
  // Docs say: GET /projects/{project_id} Returns ProjectSchema which has knowledge_sources.
  // Let's use that.
  try {
    const project = await apiRequest<BackendProject>(`/projects/${projectId}`);
    // The project.knowledge_sources returned might be brief schemas.
    // If we need full details, we might need to fetch them individually if brief is too brief.
    // Assuming backend returns enough info.
    // Wait, `BackendProject` interface above has `knowledge_sources?: BackendKnowledgeSource[]`.
    // Valid for now.
    if (!project.knowledge_sources) return [];
    
    // We need to inject projectId manually if not present, as these belong to this project
    return project.knowledge_sources.map(ks => ({
      ...mapKnowledgeSource(ks),
      projectId: projectId // Ensure projectId is set correctly
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function fetchKnowledgeSourceById(
  id: number
): Promise<KnowledgeSource | undefined> {
  try {
    const ks = await apiRequest<BackendKnowledgeSource>(`/knowledge-sources/${id}`);
    return mapKnowledgeSource(ks);
  } catch (e) {
    return undefined;
  }
}

// =============================================================================
// READ Operations - Knowledge Artifacts
// =============================================================================

export async function fetchKnowledgeArtifacts(): Promise<KnowledgeArtifact[]> {
  const artifacts = await apiRequest<BackendKnowledgeArtifact[]>("/knowledge-artifacts/");
  return artifacts.map(mapKnowledgeArtifact);
}

export async function fetchKnowledgeArtifactsBySourceId(
  sourceId: number
): Promise<KnowledgeArtifact[]> {
  // Similar to sources, backend docs don't show ?sourceId filter on /knowledge-artifacts
  // But accessing /knowledge-sources/{id} usually returns artifacts.
  try {
    const source = await apiRequest<BackendKnowledgeSource>(`/knowledge-sources/${sourceId}`);
    return source.artifacts?.map(mapKnowledgeArtifact) || [];
  } catch (e) {
    return [];
  }
}

// =============================================================================
// READ Operations - Dashboard Stats
// =============================================================================

export interface DashboardStats {
  projects: number;
  sources: number;
  artifacts: number;
  researchers: number;
  favouriteSources: number;
  bookmarkedArtifacts: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  // Not implemented in backend docs yet?
  // "GET /ai/health" exists but not stats.
  // We might have to fetch lists and count.
  // Or maybe there is a new endpoint not documented?
  // Let's fetching lists for now as fallback.
  try {
    const [projects, sources, artifacts, researchers] = await Promise.all([
      fetchProjects(),
      fetchKnowledgeSources(),
      fetchKnowledgeArtifacts(),
      fetchResearchers()
    ]);
    
    return {
      projects: projects.length,
      sources: sources.length,
      artifacts: artifacts.length,
      researchers: researchers.length,
      favouriteSources: sources.filter(s => s.isFavourite).length,
      bookmarkedArtifacts: artifacts.filter(a => a.isBookmarked).length,
    };
  } catch (e) {
    console.error("Failed to fetch dashboard stats", e);
    // Return zeros on error
    return {
      projects: 0,
      sources: 0,
      artifacts: 0,
      researchers: 0,
      favouriteSources: 0,
      bookmarkedArtifacts: 0,
    };
  }
}

// =============================================================================
// WRITE Operations - Artifact Mutations
// =============================================================================

export async function updateArtifactStatus(
  id: number,
  status: "suggestion" | "final"
): Promise<KnowledgeArtifact> {
  const updated = await apiRequest<BackendKnowledgeArtifact>(`/knowledge-artifacts/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  return mapKnowledgeArtifact(updated);
}

export async function updateArtifactBookmark(
  id: number,
  isBookmarked: boolean
): Promise<KnowledgeArtifact> {
  const updated = await apiRequest<BackendKnowledgeArtifact>(`/knowledge-artifacts/${id}`, {
    method: "PUT",
    body: JSON.stringify({ is_bookmarked: isBookmarked }),
  });
  return mapKnowledgeArtifact(updated);
}

export async function addArtifactTag(
  id: number,
  tag: string
): Promise<KnowledgeArtifact> {
  // Backend stores tags as comma-separated string.
  // READ -> MODIFY -> WRITE pattern needed if backend doesn't support "ADD TAG" atomic op.
  // Or maybe backend handles "tags" field update?
  // Docs say Update Body: KnowledgeArtifactBase.
  // So we probably need to fetch, append, update.
  const artifact = await apiRequest<BackendKnowledgeArtifact>(`/knowledge-artifacts/${id}`);
  const currentTags = artifact.tags ? artifact.tags.split(",").map(t => t.trim()) : [];
  if (!currentTags.includes(tag)) {
    currentTags.push(tag);
    const newTagsStr = currentTags.join(",");
    const updated = await apiRequest<BackendKnowledgeArtifact>(`/knowledge-artifacts/${id}`, {
      method: "PUT",
      body: JSON.stringify({ tags: newTagsStr }),
    });
    return mapKnowledgeArtifact(updated);
  }
  return mapKnowledgeArtifact(artifact);
}

export async function removeArtifactTag(
  id: number,
  tag: string
): Promise<KnowledgeArtifact> {
  const artifact = await apiRequest<BackendKnowledgeArtifact>(`/knowledge-artifacts/${id}`);
  const currentTags = artifact.tags ? artifact.tags.split(",").map(t => t.trim()) : [];
  const newTags = currentTags.filter(t => t !== tag);
  const newTagsStr = newTags.join(",");
  
  const updated = await apiRequest<BackendKnowledgeArtifact>(`/knowledge-artifacts/${id}`, {
    method: "PUT",
    body: JSON.stringify({ tags: newTagsStr }),
  });
  return mapKnowledgeArtifact(updated);
}

export async function updateArtifactNotes(
  id: number,
  notes: string
): Promise<KnowledgeArtifact> {
  const updated = await apiRequest<BackendKnowledgeArtifact>(`/knowledge-artifacts/${id}`, {
    method: "PUT",
    body: JSON.stringify({ notes }),
  });
  return mapKnowledgeArtifact(updated);
}

// =============================================================================
// WRITE Operations - Chat
// =============================================================================

export interface ChatResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export async function sendArtifactChatMessage(
  artifactId: number,
  message: string
): Promise<ChatResponse> {
  // Needs knowledge source context.
  // First, find the artifact to get its source ID?
  // Or assume the chat endpoint handles it?
  // Docs: POST /ai/chat
  // Body: { message, knowledge_source_id, ... }
  // We need the Source ID.
  // Let's fetch the artifact first to be sure.
  const artifact = await apiRequest<BackendKnowledgeArtifact>(`/knowledge-artifacts/${artifactId}`);
  const sourceId = artifact.knowledge_source_id;

  const result = await apiRequest<any>("/ai/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      knowledge_source_id: sourceId,
    }),
  });

  // Result will likely be just the answer string or object?
  // Docs say "Chat result".
  // Assuming it returns the assistant's response content.
  
  const userMessage: ChatMessage = {
    role: "user",
    content: message,
    timestamp: new Date().toISOString(),
  };
  
  const assistantMessage: ChatMessage = {
    role: "assistant",
    content: result.response || result.message || JSON.stringify(result), // Adjust based on actual AI response structure
    timestamp: new Date().toISOString(),
  };
  
  return { userMessage, assistantMessage };
}

// =============================================================================
// WRITE Operations - Knowledge Source Mutations
// =============================================================================

export async function updateKnowledgeSourceFavourite(
  id: number,
  isFavourite: boolean
): Promise<KnowledgeSource> {
  const updated = await apiRequest<BackendKnowledgeSource>(`/knowledge-sources/${id}`, {
    method: "PUT", // Docs say PUT for update
    body: JSON.stringify({ is_favourite: isFavourite }),
  });
  return mapKnowledgeSource(updated);
}
