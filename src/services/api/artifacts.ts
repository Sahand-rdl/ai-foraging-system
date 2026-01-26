/**
 * Knowledge Artifact API Services
 */

import { type KnowledgeArtifact } from "@/types/source";
import { apiRequest } from "./client";
import { type BackendKnowledgeArtifact, type BackendKnowledgeSource } from "./types";
import { mapKnowledgeArtifact } from "./mappers";

export async function fetchKnowledgeArtifacts(): Promise<KnowledgeArtifact[]> {
  const artifacts = await apiRequest<BackendKnowledgeArtifact[]>("/knowledge-artifacts/");
  return artifacts.map(mapKnowledgeArtifact);
}

export async function fetchKnowledgeArtifactsBySourceId(
  sourceId: number
): Promise<KnowledgeArtifact[]> {
  try {
    const source = await apiRequest<BackendKnowledgeSource>(`/knowledge-sources/${sourceId}`);
    return source.artifacts?.map(mapKnowledgeArtifact) || [];
  } catch (e) {
    return [];
  }
}

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

export async function updateArtifactContent(
  id: number,
  content: string
): Promise<KnowledgeArtifact> {
  const updated = await apiRequest<BackendKnowledgeArtifact>(`/knowledge-artifacts/${id}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
  return mapKnowledgeArtifact(updated);
}

export async function deleteArtifact(id: number): Promise<void> {
  await apiRequest(`/knowledge-artifacts/${id}`, {
    method: "DELETE",
  });
}
