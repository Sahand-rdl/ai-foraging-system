/**
 * Dashboard API Services
 */

import { fetchProjects } from "./projects";
import { fetchResearchers } from "./researchers";
import { fetchKnowledgeSources } from "./sources";
import { fetchKnowledgeArtifacts } from "./artifacts";
import { type DashboardStats } from "./types";

export async function fetchDashboardStats(): Promise<DashboardStats> {
  // Not implemented in backend docs yet.
  // We use fallbacks by fetching lists and counting.
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
