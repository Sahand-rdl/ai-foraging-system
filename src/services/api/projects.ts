/**
 * Project API Services
 */

import { type Project } from "@/types/source";
import { apiRequest } from "./client";
import { type BackendProject } from "./types";
import { mapProject } from "./mappers";

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

export interface CreateProjectInput {
  name: string;
  mlProjectDefinition: string;
  tags?: string[];
  researcherIds?: number[];
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  // Create the project first (backend only accepts name, ml_project_definition, tags)
  const backendPayload = {
    name: input.name,
    ml_project_definition: input.mlProjectDefinition,
    tags: input.tags?.join(",") || "",
  };
  
  const created = await apiRequest<BackendProject>("/projects/", {
    method: "POST",
    body: JSON.stringify(backendPayload),
  });
  
  // Add researchers separately if provided
  if (input.researcherIds && input.researcherIds.length > 0) {
    for (const researcherId of input.researcherIds) {
      await apiRequest<BackendProject>(`/projects/${created.id}/researchers/${researcherId}`, {
        method: "POST",
      });
    }
    // Fetch updated project with researchers
    const updated = await apiRequest<BackendProject>(`/projects/${created.id}`);
    return mapProject(updated);
  }
  
  return mapProject(created);
}

export async function deleteProject(id: number): Promise<void> {
  await apiRequest(`/projects/${id}`, {
    method: "DELETE",
  });
}
