import { getApiBase, ApiError } from "@/lib/api/client";

export interface ConversationSummary {
  id: string;
  title: string;
  message_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string | null;
}

export interface ConversationDetail {
  id: string;
  messages: ConversationMessage[];
}

export async function listConversations(): Promise<ConversationSummary[]> {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/conversations`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new ApiError(res.status, "Failed to load conversations");
  }
  return res.json();
}

export async function getConversation(
  id: string
): Promise<ConversationDetail> {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/conversations/${id}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new ApiError(res.status, `Failed to load conversation ${id}`);
  }
  return res.json();
}

export async function deleteConversation(id: string): Promise<void> {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/conversations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) {
    throw new ApiError(res.status, `Failed to delete conversation ${id}`);
  }
}
