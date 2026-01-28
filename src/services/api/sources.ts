/**
 * Knowledge Source API Services
 */

import { type KnowledgeSource } from "@/types/source";
import { apiRequest } from "./client";
import { type BackendKnowledgeSource, type BackendProject } from "./types";
import { mapKnowledgeSource } from "./mappers";

export async function fetchKnowledgeSources(): Promise<KnowledgeSource[]> {
  const sources = await apiRequest<BackendKnowledgeSource[]>("/knowledge-sources/");
  return sources.map(mapKnowledgeSource);
}

export async function fetchKnowledgeSourcesByProjectId(
  projectId: number
): Promise<KnowledgeSource[]> {
  try {
    const project = await apiRequest<BackendProject>(`/projects/${projectId}`);
    
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

export async function deleteKnowledgeSource(id: number): Promise<void> {
  await apiRequest<void>(`/knowledge-sources/${id}`, {
    method: "DELETE",
  });
}
