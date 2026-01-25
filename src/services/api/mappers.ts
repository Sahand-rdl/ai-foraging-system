/**
 * API Data Mappers
 * 
 * Functions to transform backend snake_case data to frontend camelCase types.
 */

import {
  type Project,
  type Researcher,
  type KnowledgeSource,
  type KnowledgeArtifact,
} from "@/types/source";

import {
  type BackendProject,
  type BackendResearcher,
  type BackendKnowledgeSource,
  type BackendKnowledgeArtifact,
} from "./types";

export function mapResearcher(r: BackendResearcher): Researcher {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
  };
}

export function mapProject(p: BackendProject): Project {
  return {
    id: p.id,
    name: p.name,
    mlProjectDefinition: p.ml_project_definition || "",
    // Backend returns objects, frontend expects IDs list for relationships currently
    researcherIds: p.researchers?.map(r => r.id) || [],
    knowledgeSourceIds: p.knowledge_sources?.map(ks => ks.id) || [],
    tags: p.tags ? p.tags.split(",").map(t => t.trim()) : [],
  };
}

export function mapKnowledgeSource(ks: BackendKnowledgeSource): KnowledgeSource {
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
    projectId: ks.project_id || 0, // Backend might not send projectId if fetched via project endpoint
    isFavourite: ks.is_favourite || false,
    path: ks.path,
  };
}

export function mapKnowledgeArtifact(ka: BackendKnowledgeArtifact): KnowledgeArtifact {
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
