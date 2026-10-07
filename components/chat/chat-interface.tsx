"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertCircle,
  ArrowDown,
  Bot,
  Check,
  ChevronRight,
  Copy,
  Download,
  FileText,
  FileUp,
  Layers,
  Loader2,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Paperclip,
  Plus,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Square,
  Trash2,
  UploadCloud,
  User,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { streamQuery } from "@/lib/api/query";
import {
  listConversations,
  getConversation,
  deleteConversation,
  type ConversationSummary,
} from "@/lib/api/conversations";
import { getDocuments } from "@/lib/api/documents";
import { uploadDocuments } from "@/lib/api/upload";
import { useApp } from "@/lib/context/app-context";
import { suggestedQuestions, type ChatMessage, type QuerySource, type Document } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function ChatInterfaceInner() {
  const searchParams = useSearchParams();
  const { activeCollectionId } = useApp();

  // Core Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // History & Sidebar State
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Documents & Scope State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Direct Attachment State
  const [attaching, setAttaching] = useState(false);
  const [attachmentProgress, setAttachmentProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to Bottom Floating Indicator
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Citation Modal State
  const [activeSource, setActiveSource] = useState<QuerySource | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Read URL query parameter "?doc=ID"
  useEffect(() => {
    const docId = searchParams.get("doc");
    if (docId) {
      setSelectedDocId(docId);
    }
  }, [searchParams]);

  // Load conversation history from backend
  const refreshConversations = useCallback(async () => {
    try {
      const data = await listConversations();
      setConversations(data);
    } catch {
      // Backend might be warming up
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshConversations();
    getDocuments()
      .then((res) => setDocuments(res.documents))
      .catch(() => {});
  }, [refreshConversations]);

  // Handle Scroll to toggle Floating Down Button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceFromBottom > 180);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBottom(false);
  };

  // Scroll to bottom when streaming starts or new messages arrive
  useEffect(() => {
    if (!showScrollBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming, showScrollBottom]);

  // Start a new clean chat session
  const startNewChat = () => {
    if (isStreaming) stopGeneration();
    setActiveConversationId(null);
    setMessages([]);
    setInput("");
    textareaRef.current?.focus();
  };

  // Switch to a previous conversation
  const loadChat = async (convId: string) => {
    if (isStreaming) return;
    setLoadingHistory(true);
    try {
      const detail = await getConversation(convId);
      setActiveConversationId(convId);
      setMessages(detail.messages);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل في تحميل المحادثة");
    } finally {
      setLoadingHistory(false);
    }
  };

  // Delete a conversation
  const handleDeleteChat = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    try {
      await deleteConversation(convId);
      toast.success("تم حذف المحادثة بنجاح");
      if (activeConversationId === convId) {
        startNewChat();
      }
      refreshConversations();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل في حذف المحادثة");
    }
  };

  // Stop generation
  const stopGeneration = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
    toast.info("تم إيقاف التوليد");
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("تم نسخ النص إلى الحافظة");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Direct Attachment Handler
  const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAttaching(true);
    setAttachmentProgress(0);

    try {
      const results = await uploadDocuments([file], {
        collectionId: activeCollectionId,
        onProgress: ({ progress }) => setAttachmentProgress(progress),
      });

      if (results[0]) {
        setSelectedDocId(results[0].id);
        toast.success(`تم إرفاق وفهرسة "${file.name}" وتعيينها كنطاق بحث`);
        const docsRes = await getDocuments();
        setDocuments(docsRes.documents);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل في إرفاق المستند");
    } finally {
      setAttaching(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Export chat transcript
  const exportChat = () => {
    if (messages.length === 0) return;
    const content = messages
      .map((m) => `### ${m.role === "user" ? "السؤال" : "الإجابة"}:\n${m.content}\n`)
      .join("\n---\n\n");
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Local_RAG_Chat_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير نص المحادثة بصيغة Markdown");
  };

  // Send query via SSE
  const sendQuery = useCallback(
    async (queryText: string, retry = false) => {
      const text = queryText.trim();
      if (!text || isStreaming) return;

      setLastQuery(text);
      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        content: text,
      };

      const assistantId = createId();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      if (retry) {
        setMessages((prev) => {
          const next = [...prev];
          if (next[next.length - 1]?.role === "assistant") next.pop();
          return [...next, assistantMessage];
        });
      } else {
        setMessages((prev) => [...prev, userMessage, assistantMessage]);
      }

      setInput("");
      setIsStreaming(true);
      abortRef.current = new AbortController();

      try {
        await streamQuery({
          query: text,
          conversationId: activeConversationId,
          collectionId: activeCollectionId,
          signal: abortRef.current.signal,
          onToken: (token) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: msg.content + token }
                  : msg
              )
            );
          },
          onSources: (sources) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId ? { ...msg, sources } : msg
              )
            );
          },
          onDone: (returnedConvId) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId ? { ...msg, isStreaming: false } : msg
              )
            );
            if (returnedConvId) {
              setActiveConversationId(returnedConvId);
            }
            refreshConversations();
          },
          onError: (error) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? {
                      ...msg,
                      isStreaming: false,
                      error: error.message,
                      content: msg.content || "تعذر إتمام الإجابة حالياً.",
                    }
                  : msg
              )
            );
          },
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const message =
          err instanceof Error ? err.message : "فشل في جلب الاستجابة";
        toast.error(message);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, isStreaming: false, error: message }
              : msg
          )
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [activeCollectionId, activeConversationId, isStreaming, refreshConversations]
  );

  const filteredConversations = conversations.filter((c) =>
    (c.title || "محادثة").toLowerCase().includes(historySearch.toLowerCase())
  );

  const selectedDoc = documents.find((d) => d.id === selectedDocId);

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* ── Collapsible History & Scope Sidebar ────────────────────────── */}
      <aside
        className={cn(
          "border-l border-border bg-card flex flex-col transition-all duration-200 z-20 shrink-0",
          isSidebarOpen ? "w-72" : "w-0 overflow-hidden border-none"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-2.5 border-b border-border flex items-center justify-between gap-2">
          <Button
            size="sm"
            onClick={startNewChat}
            className="flex-1 text-xs font-semibold gap-1.5 bg-foreground text-background hover:bg-foreground/90 rounded cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>محادثة جديدة</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsSidebarOpen(false)}
            title="طي القائمة الجانبية"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        </div>

        {/* History Search Bar */}
        <div className="p-3 border-b border-border/40">
          <div className="relative">
            <Search className="absolute right-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="بحث في سجل المحادثات..."
              className="h-8 pr-8 text-xs bg-background/50 rounded-lg"
            />
          </div>
        </div>

        {/* Conversation History List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingHistory ? (
            <div className="flex items-center justify-center p-6 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              {historySearch ? "لا توجد نتائج مطابقة" : "لا توجد محادثات سابقة"}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = activeConversationId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => loadChat(conv.id)}
                  className={cn(
                    "group flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer transition-colors text-right",
                    isActive
                      ? "bg-muted text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className="size-3.5 shrink-0" />
                    <span className="truncate">{conv.title || "محادثة استرجاع معرفي"}</span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteChat(e, conv.id)}
                    className="opacity-0 group-hover:opacity-100 size-6 flex items-center justify-center rounded-md hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-all"
                    title="حذف المحادثة"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Knowledge Scope / Active Document Filter */}
        <div className="p-3 border-t border-border bg-card/60 space-y-2">
          <label className="text-[11px] font-medium text-muted-foreground block">
            نطاق الاستجواب:
          </label>
          <select
            value={selectedDocId ?? ""}
            onChange={(e) => setSelectedDocId(e.target.value || null)}
            className="w-full text-xs rounded border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:border-foreground"
          >
            <option value="">جميع المستندات (الكل)</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                📄 {doc.name}
              </option>
            ))}
          </select>

          <div className="rounded border border-border bg-background p-2 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                المحرك المحلي
              </span>
              <span className="font-mono text-[10px] text-foreground">LM Studio (Qwen)</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                محرك المتجهات
              </span>
              <span className="font-mono text-[10px] text-foreground">Qdrant Vector DB</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Chat Workspace ────────────────────────────────────────── */}
      <section className="flex flex-1 flex-col h-full min-w-0 overflow-hidden relative">
        {/* Workspace Sub-Toolbar */}
        <div className="h-9 border-b border-border px-3 flex items-center justify-between bg-card/40 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className={cn(
                "flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors cursor-pointer",
                isSidebarOpen ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              title={isSidebarOpen ? "إخفاء سجل المحادثات" : "عرض سجل المحادثات"}
            >
              <MessageSquare className="size-3.5" />
              <span>سجل المحادثات ({conversations.length})</span>
            </button>

            <span className="text-border">|</span>

            <span className="text-[11px] text-muted-foreground font-mono">
              {activeConversationId ? "جلسة نشطة" : "محادثة جديدة"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <>
                <button
                  onClick={exportChat}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted cursor-pointer"
                >
                  <Download className="size-3" />
                  <span>تصدير</span>
                </button>
                <button
                  onClick={startNewChat}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted cursor-pointer"
                >
                  <span>مسح</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Message Feed Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8 space-y-6 relative"
        >
          {messages.length === 0 ? (
            /* Welcome State */
            <div className="flex min-h-full flex-col items-center justify-center max-w-xl mx-auto text-center px-4 py-12">
              <div className="size-10 rounded border border-border bg-card flex items-center justify-center mb-4 font-mono font-black text-xs text-foreground">
                RAG
              </div>

              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Local RAG Workstation • استوديو الاستنطاق
              </h2>
              <p className="mt-1.5 text-xs text-muted-foreground max-w-md leading-relaxed">
                استخرج المعلومات الموثقة برقم الصفحة والفقرة من مستنداتك عبر الذكاء الاصطناعي المحلي.
              </p>

              {/* Suggestions or Upload Prompt */}
              {documents.length === 0 ? (
                <div className="mt-6 p-5 rounded border border-dashed border-border bg-card/60 max-w-md text-center space-y-2.5">
                  <UploadCloud className="size-6 text-muted-foreground mx-auto" />
                  <p className="text-xs font-semibold text-foreground">قاعدة المعرفة فارغة حالياً</p>
                  <p className="text-[11px] text-muted-foreground">
                    قم برفع أو إرفاق مستند أولاً لتتمكن من استنطاقه والبحث فيه.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-7 text-xs font-medium gap-1.5 rounded bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
                  >
                    <Paperclip className="size-3" />
                    <span>إرفاق مستند الآن</span>
                  </Button>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full text-right">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendQuery(q)}
                      disabled={isStreaming}
                      className="flex flex-col justify-between p-2.5 rounded border border-border bg-card hover:bg-muted/50 hover:border-foreground/30 transition-colors text-right cursor-pointer"
                    >
                      <span className="text-xs text-foreground leading-relaxed">
                        {q}
                      </span>
                      <span className="mt-2 font-mono text-[10px] text-muted-foreground">
                        _ اضغط للإرسال
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Message Thread */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded bg-foreground text-background font-mono font-bold text-[10px] mt-0.5">
                      RAG
                    </div>
                  )}

                  <div
                    className={cn(
                      "relative group rounded px-4 py-3 text-xs sm:text-sm leading-relaxed max-w-[85%]",
                      message.role === "user"
                        ? "bg-muted text-foreground border border-border"
                        : "bg-card border border-border text-foreground"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none space-y-2.5">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content || (message.isStreaming ? "▍" : "")}
                        </ReactMarkdown>

                        {message.isStreaming && (
                          <span className="inline-block animate-pulse text-foreground font-bold">
                            ▍
                          </span>
                        )}

                        {/* Message Actions */}
                        {!message.isStreaming && message.content && (
                          <div className="flex items-center justify-between border-t border-border pt-2 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs gap-1 hover:text-foreground rounded"
                                onClick={() => copyToClipboard(message.content, message.id)}
                              >
                                {copiedId === message.id ? (
                                  <>
                                    <Check className="size-3 text-emerald-500" />
                                    <span>تم النسخ</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="size-3" />
                                    <span>نسخ</span>
                                  </>
                                )}
                              </Button>

                              {lastQuery && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs gap-1 hover:text-foreground rounded"
                                  onClick={() => sendQuery(lastQuery, true)}
                                  title="إعادة صياغة الإجابة"
                                >
                                  <RotateCcw className="size-3" />
                                  <span>إعادة المحاولة</span>
                                </Button>
                              )}
                            </div>
                            <span className="text-[10px] font-mono opacity-70">
                              {message.content.length} حرف
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}

                    {/* Error Box */}
                    {message.error && (
                      <div className="mt-2.5 flex items-center gap-2 rounded bg-destructive/10 p-2.5 text-xs text-destructive border border-destructive/20">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>{message.error}</span>
                        {lastQuery && !message.isStreaming && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs mr-auto hover:bg-destructive/20"
                            onClick={() => sendQuery(lastQuery, true)}
                          >
                            <RotateCcw className="size-3 ml-1" /> إعادة المحاولة
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Interactive Source Citations */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 border-t border-border pt-2.5 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <FileText className="size-3.5" />
                          <span>المصادر الموثقة ({message.sources.length})</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            • اضغط للمعاينة
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {message.sources.map((source, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveSource(source)}
                              className="flex items-center gap-1.5 rounded border border-border bg-background px-2 py-1 text-xs font-medium hover:border-foreground/40 hover:bg-muted/40 transition-colors group text-right cursor-pointer"
                            >
                              <span className="text-muted-foreground">📄</span>
                              <span className="truncate max-w-[160px] text-foreground">
                                {source.documentName ?? "مستند"}
                              </span>
                              {source.page && (
                                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
                                  ص {source.page}
                                </span>
                              )}
                              {source.score && (
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {Math.round(source.score * 100)}%
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded bg-muted border border-border text-muted-foreground mt-0.5">
                      <User className="size-3.5" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Floating Scroll to Bottom Button */}
          {showScrollBottom && (
            <Button
              variant="outline"
              size="sm"
              onClick={scrollToBottom}
              className="fixed bottom-28 left-1/2 -translate-x-1/2 z-30 shadow-md border-border bg-card text-xs gap-1.5 rounded px-3 py-1 cursor-pointer"
            >
              <ArrowDown className="size-3 text-foreground" />
              <span>النزول للأسفل</span>
            </Button>
          )}
        </div>

        {/* Bottom Input Dock */}
        <div className="p-3 bg-background border-t border-border shrink-0">
          <div className="max-w-3xl mx-auto">
            {/* Hidden Attachment Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md,.json"
              className="hidden"
              onChange={handleAttachFile}
            />

            {/* Active Document Scope Banner */}
            {selectedDoc && (
              <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded border border-border bg-card text-xs">
                <span className="flex items-center gap-1.5 text-foreground font-medium truncate">
                  <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                  <span>نطاق الاستجواب:</span>
                  <span className="font-mono text-foreground truncate max-w-xs">{selectedDoc.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDocId(null)}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground mr-2 cursor-pointer"
                  title="إلغاء الحصر والبحث في كافة المستندات"
                >
                  <span>إلغاء الحصر</span>
                  <X className="size-3" />
                </button>
              </div>
            )}

            {/* Attaching Progress Pill */}
            {attaching && (
              <div className="flex items-center gap-2 px-3 py-1.5 mb-2 rounded border border-border bg-card text-xs">
                <Loader2 className="size-3.5 animate-spin text-foreground" />
                <span className="text-muted-foreground">جاري فهرسة المستند المرفق...</span>
                <span className="font-mono text-foreground font-bold mr-auto">{attachmentProgress}%</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendQuery(input);
              }}
              className="relative flex items-center rounded border border-border bg-card focus-within:border-foreground/40 transition-colors p-1.5"
            >
              {/* Attachment Button */}
              <button
                type="button"
                disabled={attaching || isStreaming}
                onClick={() => fileInputRef.current?.click()}
                className="size-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 shrink-0 cursor-pointer"
                title="إرفاق مستند جديد للاستجواب الفوري"
              >
                {attaching ? (
                  <Loader2 className="size-3.5 animate-spin text-foreground" />
                ) : (
                  <Paperclip className="size-3.5" />
                )}
              </button>

              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اسأل سؤالاً حول المستندات... (Enter للإرسال)"
                className="min-h-[36px] max-h-32 border-0 bg-transparent focus-visible:ring-0 resize-none py-2 px-2.5 text-xs sm:text-sm flex-1 text-foreground placeholder:text-muted-foreground"
                rows={1}
                disabled={isStreaming}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendQuery(input);
                  }
                }}
              />

              <div className="flex items-center gap-1.5 pl-1 shrink-0">
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={stopGeneration}
                    className="size-7 rounded flex items-center justify-center border border-destructive/40 text-destructive hover:bg-destructive/10 cursor-pointer"
                    title="إيقاف التوليد"
                  >
                    <Square className="size-3" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="size-7 rounded flex items-center justify-center bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="إرسال السؤال"
                  >
                    <Send className="size-3.5" />
                  </button>
                )}
              </div>
            </form>

            <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-muted-foreground px-1">
              <span>معالجة محلية 100% On-Premises • LM Studio + Qdrant</span>
              <span className="hidden sm:inline">Enter: إرسال • Shift+Enter: سطر جديد</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Citation Inspection Dialog ──────────────────────── */}
      <Dialog
        open={Boolean(activeSource)}
        onOpenChange={(open) => !open && setActiveSource(null)}
      >
        <DialogContent className="max-w-xl max-h-[85vh] flex flex-col text-right">
          <DialogHeader className="text-right">
            <DialogTitle className="flex items-center gap-2 text-sm font-bold">
              <FileText className="size-4 text-foreground" />
              <span>معاينة الاقتباس الموثق</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              الفقرة المسترجعة مباشرة من محرك البحث الدلالي لدعم الإجابة
            </DialogDescription>
          </DialogHeader>

          {activeSource && (
            <div className="space-y-3 my-2 flex-1 overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded border border-border bg-muted/40 text-xs">
                <div>
                  <span className="text-muted-foreground">المستند: </span>
                  <span className="font-semibold text-foreground">
                    {activeSource.documentName ?? "غير محدد"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  {activeSource.page && (
                    <span className="bg-background px-2 py-0.5 rounded border border-border">
                      ص {activeSource.page}
                    </span>
                  )}
                  {activeSource.score && (
                    <span className="text-foreground">
                      تطابق: {Math.round(activeSource.score * 100)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="relative rounded border border-border bg-background p-3 text-xs font-mono leading-relaxed text-muted-foreground whitespace-pre-wrap max-h-72 overflow-y-auto">
                {activeSource.chunkText ?? "لا يوجد نص متاح."}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs rounded h-7 cursor-pointer"
                  onClick={() => {
                    if (activeSource.chunkText) {
                      navigator.clipboard.writeText(activeSource.chunkText);
                      toast.success("تم نسخ الفقرة المقتبسة");
                    }
                  }}
                >
                  <Copy className="size-3 ml-1" />
                  نسخ الفقرة
                </Button>
                <Button
                  size="sm"
                  className="text-xs rounded h-7 bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
                  onClick={() => setActiveSource(null)}
                >
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ChatInterface() {
  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>}>
      <ChatInterfaceInner />
    </Suspense>
  );
}
