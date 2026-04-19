// ============================================
// Database Types for AI Foraging Application
// Based on whiteboard schema
// ============================================

// --- Researcher (RID) ---
export interface Researcher {
  id: number; // RID
  name: string;
  email: string;
}

// --- Project (PID) ---
export interface Project {
  id: number; // PID
  name: string;
  mlProjectDefinition: string;
  knowledgeSourceIds: number[]; // List of KSID
  researcherIds: number[]; // List of RID
  tags: string[]; // From TF-IDF
  source_count: number;
  artifact_count: number;
}

// --- Knowledge Source (KSID) ---
export type Trustworthiness = "High" | "Medium" | "Low";

export interface KnowledgeSourceMetadata {
  title?: string;
  authors?: string | string[];
  date?: string;
  venue?: string;
  doi?: string;
  url?: string;
  [key: string]: unknown; // Allow additional JSON fields
}

export interface KnowledgeSource {
  id: number; // KSID
  metadata: KnowledgeSourceMetadata; // JSON
  rawText: string;
  knowledgeArtifactIds: number[]; // List of KAID
  trustworthiness: Trustworthiness;
  trustworthinessReason?: string;
  projectId: number; // PID
  isFavourite: boolean;
  path?: string; // Path to raw PDF
}

// --- Knowledge Artifact (KAID) ---
export type KAType = "terminology" | "figure" | "table" | "algorithm";
export type KAStatus = "suggestion" | "final";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface KnowledgeArtifact {
  id: number; // KAID
  type: KAType;
  title: string;
  content: string;
  status: KAStatus;
  tags: string[];
  notes: string;
  knowledgeSourceId: number; // KSID
  externalLink?: string;
  isBookmarked: boolean;
  chatHistory: ChatMessage[];
}