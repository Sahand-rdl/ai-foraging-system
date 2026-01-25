/**
 * API Types
 * 
 * Interfaces reflecting the backend data shape (snake_case).
 */

export interface BackendProject {
  id: number;
  name: string;
  ml_project_definition?: string;
  tags?: string;
  researchers?: BackendResearcher[];
  knowledge_sources?: BackendKnowledgeSource[];
}

export interface BackendResearcher {
  id: number;
  name: string;
  email: string;
}

export interface BackendKnowledgeSource {
  id: number;
  path: string;
  source_metadata?: any;
  raw_text?: string;
  trustworthiness?: number;
  is_favourite?: boolean;
  artifacts?: BackendKnowledgeArtifact[];
  project_id?: number;
}

export interface BackendKnowledgeArtifact {
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

export interface ChatResponse {
  userMessage: import("@/types/source").ChatMessage;
  assistantMessage: import("@/types/source").ChatMessage;
}

export interface DashboardStats {
  projects: number;
  sources: number;
  artifacts: number;
  researchers: number;
  favouriteSources: number;
  bookmarkedArtifacts: number;
}
