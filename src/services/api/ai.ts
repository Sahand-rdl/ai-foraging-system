/**
 * AI/Chat API Services
 */

import { type ChatMessage } from "@/types/source";
import { apiRequest } from "./client";
import { type BackendKnowledgeArtifact, type ChatResponse } from "./types";

export async function sendChatMessageToSource(
  doc_id: number,
  query: string
): Promise<ChatResponse> {

  const result = await apiRequest<any>("/ai/chat", {
    method: "POST",
    body: JSON.stringify({
      doc_id: doc_id,
      query: query,
    }),
  });
  
  const userMessage: ChatMessage = {
    role: "user",
    content: query,
    timestamp: new Date().toISOString(),
  };
  
  const assistantMessage: ChatMessage = {
    role: "assistant",
    content: result.data?.reply || "Error: Could not retrieve reply.",
    timestamp: new Date().toISOString(),
  };
  
  return { userMessage, assistantMessage };
}
