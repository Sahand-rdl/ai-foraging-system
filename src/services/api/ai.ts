/**
 * AI/Chat API Services
 */

import { type ChatMessage } from "@/types/source";
import { apiRequest } from "./client";
import { type BackendKnowledgeArtifact, type ChatResponse } from "./types";

export async function sendArtifactChatMessage(
  artifactId: number,
  message: string
): Promise<ChatResponse> {
  // First, find the artifact to get its source ID
  const artifact = await apiRequest<BackendKnowledgeArtifact>(`/knowledge-artifacts/${artifactId}`);
  const sourceId = artifact.knowledge_source_id;

  const result = await apiRequest<any>("/ai/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      knowledge_source_id: sourceId,
    }),
  });
  
  const userMessage: ChatMessage = {
    role: "user",
    content: message,
    timestamp: new Date().toISOString(),
  };
  
  const assistantMessage: ChatMessage = {
    role: "assistant",
    content: result.response || result.message || JSON.stringify(result),
    timestamp: new Date().toISOString(),
  };
  
  return { userMessage, assistantMessage };
}
