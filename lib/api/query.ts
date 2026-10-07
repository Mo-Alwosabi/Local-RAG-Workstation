import { getApiBase, ApiError } from "@/lib/api/client";
import { normalizeSources } from "@/lib/api/normalize";
import type { QuerySource } from "@/lib/types";

export interface StreamQueryOptions {
  query: string;
  conversationId?: string | null;
  collectionId?: string | null;
  signal?: AbortSignal;
  onToken: (token: string) => void;
  onSources: (sources: QuerySource[]) => void;
  onDone: (conversationId?: string) => void;
  onError: (error: Error) => void;
}

function parseSseChunk(
  chunk: string,
  handlers: Pick<
    StreamQueryOptions,
    "onToken" | "onSources" | "onDone" | "onError"
  >,
  context: { conversationId?: string }
) {
  const lines = chunk.split("\n");
  for (const line of lines) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") {
      handlers.onDone(context.conversationId);
      return;
    }

    try {
      const parsed = JSON.parse(data) as Record<string, unknown>;
      const type = String(parsed.type ?? parsed.event ?? "");

      if (parsed.conversation_id) {
        context.conversationId = String(parsed.conversation_id);
      }

      if (type === "done") {
        const convId = String(parsed.conversation_id ?? context.conversationId ?? "");
        if (convId) context.conversationId = convId;
        handlers.onDone(context.conversationId);
        continue;
      }

      if (type === "sources" || parsed.sources) {
        handlers.onSources(normalizeSources(parsed.sources ?? parsed.data));
        continue;
      }

      if (type === "error") {
        handlers.onError(
          new Error(String(parsed.message ?? parsed.content ?? "Stream error"))
        );
        return;
      }

      const token = String(
        parsed.content ??
          parsed.token ??
          parsed.text ??
          parsed.delta ??
          (type === "token" ? parsed.data : "") ??
          ""
      );
      if (token) handlers.onToken(token);
    } catch {
      if (data) handlers.onToken(data);
    }
  }
}

export async function streamQuery(options: StreamQueryOptions): Promise<void> {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      query: options.query,
      conversation_id: options.conversationId ?? undefined,
      collection_id: options.collectionId ?? undefined,
      stream: true,
    }),
    signal: options.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, text || res.statusText);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const streamContext: { conversationId?: string } = {
    conversationId: options.conversationId ?? undefined,
  };

  if (!contentType.includes("text/event-stream")) {
    const json = (await res.json()) as Record<string, unknown>;
    if (json.sources) {
      options.onSources(normalizeSources(json.sources));
    }
    const answer = String(json.answer ?? json.response ?? json.content ?? "");
    if (answer) options.onToken(answer);
    const convId = (json.conversation_id as string) ?? options.conversationId ?? undefined;
    options.onDone(convId);
    return;
  }

  if (!res.body) throw new ApiError(500, "No response stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) parseSseChunk(part, options, streamContext);
  }

  if (buffer.trim()) parseSseChunk(buffer, options, streamContext);
  options.onDone(streamContext.conversationId);
}
