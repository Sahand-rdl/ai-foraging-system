/**
 * Researcher API Services
 */

import { type Researcher } from "@/types/source";
import { apiRequest } from "./client";
import { type BackendResearcher } from "./types";
import { mapResearcher } from "./mappers";

export async function fetchResearchers(): Promise<Researcher[]> {
  const researchers = await apiRequest<BackendResearcher[]>("/researchers/");
  return researchers.map(mapResearcher);
}

export async function fetchResearchersByIds(ids: number[]): Promise<Researcher[]> {
  // Not directly supported by backend as a batch endpoint based on known endpoints.
  // We can fetch all and filter (inefficient but works for small sets) or simple loop.
  const all = await fetchResearchers();
  return all.filter(r => ids.includes(r.id));
}
