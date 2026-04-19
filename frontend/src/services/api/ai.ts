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
  
  /* 
   * The backend returns a structure like: 
   * { "success": true, "data": { "reply": "..." } } 
   * OR direct keys depending on the service/error.
   * We need to parse this robustly.
   */
  let content = "No response received.";
  
  if (result.data && result.data.reply) {
    content = result.data.reply;
  } else if (result.reply) {
    content = result.reply;
  } else if (result.message) {
      content = result.message;
  } else {
    content = JSON.stringify(result);
  }

  const assistantMessage: ChatMessage = {
    role: "assistant",
    content: content,
    timestamp: new Date().toISOString(),
  };
  
  return { userMessage, assistantMessage };
}

export async function sendSourceChatMessage(
  sourceId: number,
  message: string
): Promise<ChatResponse> {
  const result = await apiRequest<any>("/ai/chat", {
    method: "POST",
    body: JSON.stringify({
      doc_id: sourceId, // Changed to doc_id as expected by backend
      query: message,    // Changed to query as expected by backend
    }),
  });
  
  const userMessage: ChatMessage = {
    role: "user",
    content: message,
    timestamp: new Date().toISOString(),
  };
  
  let content = "No response received.";
  
  if (result.data && result.data.reply) {
    content = result.data.reply;
  } else if (result.reply) {
    content = result.reply;
  } else if (result.message) {
      content = result.message;
  } else {
    content = JSON.stringify(result);
  }

  const assistantMessage: ChatMessage = {
    role: "assistant",
    content: content,
    timestamp: new Date().toISOString(),
  };
  
  return { userMessage, assistantMessage };
}