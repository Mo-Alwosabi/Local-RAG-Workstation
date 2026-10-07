"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  FileSpreadsheet,
  FileText,
  FileType,
  Folder,
  FolderOpen,
  FolderPlus,
  HelpCircle,
  LayoutDashboard,
  Layers,
  MessageSquare,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Radio,
  Search,
  Settings,
  Sparkles,
  Sun,
  Terminal,
  Trash2,
  Upload,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/context/app-context";
import { useDocuments } from "@/lib/hooks/use-documents";
import { useCollections } from "@/lib/hooks/use-collections";
import { uploadDocuments } from "@/lib/api/upload";
import { createCollection } from "@/lib/api/collections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CortexWorkstationProps {
  children: React.ReactNode;
  activePath: string;
  fullBleed?: boolean;
}

export function CortexWorkstation({
  children,
  activePath,
  fullBleed = false,
}: CortexWorkstationProps) {
  const router = useRouter();
  const { theme, toggleTheme, activeCollectionId, setActiveCollectionId, refresh } = useApp();
  const { documents, refetch: refetchDocuments } = useDocuments();
  const { collections, refetch: refetchCollections } = useCollections();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    general: true,
  });

  // Upload modal / trigger
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // New collection modal
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploading(true);
    try {
      await uploadDocuments(list, { collectionId: activeCollectionId });
      toast.success(`تم رفع وفهرسة ${list.length} مستند بنجاح`);
      refresh();
      refetchDocuments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل في رفع المستند");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createCollection(newFolderName.trim());
      toast.success(`تم إنشاء المجموعة "${newFolderName.trim()}"`);
      setNewFolderName("");
      setShowCreateFolder(false);
      refetchCollections();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل إنشاء المجموعة");
    }
  };

  // Keyboard shortcuts from Cortex UI (_ c, _ d, _ g, _ o, _ s)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        showCreateFolder
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "c") {
        router.push("/chat");
      } else if (key === "d") {
        router.push("/documents");
      } else if (key === "g") {
        router.push("/dashboard");
      } else if (key === "o") {
        router.push("/settings");
      } else if (key === "s") {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, showCreateFolder]);

  const navItems = [
    { label: "المحادثة والاستنطاق", href: "/chat", icon: MessageSquare, keyHint: "_ c" },
    { label: "إدارة المستندات", href: "/documents", icon: FileText, keyHint: "_ d" },
    { label: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard, keyHint: "_ g" },
    { label: "الإعدادات", href: "/settings", icon: Settings, keyHint: "_ o" },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans select-none">
      {/* ── 1. LEFT CORTEX SIDEBAR ───────────────────────────────────── */}
      <aside
        className={cn(
          "flex flex-col border-l border-border bg-card transition-all duration-200 shrink-0 z-30",
          sidebarOpen ? "w-64 sm:w-72" : "w-0 overflow-hidden border-none"
        )}
      >
        {/* Workspace Brand Header */}
        <div className="flex h-12 items-center justify-between px-3.5 border-b border-border">
          <Link href="/chat" className="flex items-center gap-2 font-mono">
            <div className="flex size-6 items-center justify-center rounded bg-foreground text-background font-mono font-black text-xs">
              LR
            </div>
            <span className="font-bold text-xs tracking-tight text-foreground truncate max-w-[150px]">Local RAG Workstation</span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSidebarOpen(false)}
              className="size-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
              title="طي القائمة الجانبية"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>
        </div>

        {/* Primary Navigation List */}
        <div className="p-2 space-y-0.5 border-b border-border text-xs">
          {navItems.map((item) => {
            const isActive = activePath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors",
                  isActive
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="size-3.5" />
                  <span>{item.label}</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground/60">{item.keyHint}</span>
              </Link>
            );
          })}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Plus className="size-3.5" />
              <span>إضافة مصدر / رفع</span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground/60">_ s</span>
          </button>
        </div>

        {/* Hidden File Picker */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.xlsx,.txt,.md,.json"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFileUpload(e.target.files);
          }}
        />

        {/* ── SUBJECTS / KNOWLEDGE TREE (From Cortex Design) ─────────── */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3">
          <div className="flex items-center justify-between px-2 text-[11px] font-mono tracking-wider text-muted-foreground uppercase">
            <span>قواعد المعرفة (SUBJECTS)</span>
            <button
              onClick={() => setShowCreateFolder(true)}
              className="size-4 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              title="إنشاء مجموعة جديدة"
            >
              <Plus className="size-3" />
            </button>
          </div>

          {/* All Documents Scope Folder */}
          <div className="space-y-0.5">
            <div
              onClick={() => {
                toggleFolder("general");
                setActiveCollectionId(null);
              }}
              className={cn(
                "flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer hover:bg-muted/40",
                !activeCollectionId && "bg-muted text-foreground font-medium"
              )}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <ChevronDown
                  className={cn(
                    "size-3 text-muted-foreground transition-transform",
                    !expandedFolders["general"] && "-rotate-90"
                  )}
                />
                <span className="truncate">📁 كافة المستندات</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                {documents.length} •
              </span>
            </div>

            {/* Document Items under General */}
            {expandedFolders["general"] && (
              <div className="pr-4 space-y-0.5 border-r border-border/40 mr-2.5">
                {documents.slice(0, 8).map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/chat?doc=${encodeURIComponent(doc.id)}`}
                    className="flex items-center justify-between px-2 py-1 rounded text-[11px] text-muted-foreground hover:bg-muted/50 hover:text-foreground truncate group"
                    title={`استجواب "${doc.name}"`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-muted border border-border shrink-0">
                        {doc.type.slice(0, 3).toUpperCase()}
                      </span>
                      <span className="truncate">{doc.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Collections List */}
          {collections.map((col) => {
            const isExpanded = expandedFolders[col.id];
            const isSelected = activeCollectionId === col.id;
            return (
              <div key={col.id} className="space-y-0.5">
                <div
                  onClick={() => {
                    toggleFolder(col.id);
                    setActiveCollectionId(col.id);
                  }}
                  className={cn(
                    "flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer hover:bg-muted/40",
                    isSelected ? "bg-muted text-foreground font-semibold" : "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ChevronDown
                      className={cn(
                        "size-3 text-muted-foreground transition-transform",
                        !isExpanded && "-rotate-90"
                      )}
                    />
                    <span className="truncate">📂 {col.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {col.documentCount} •
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer: Engine Connection Pill & Theme */}
        <div className="p-3 border-t border-border bg-card/60 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>محلي متصل</span>
            </span>
            <span className="font-mono text-[10px]">LM Studio</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/settings"
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <Settings className="size-3.5" />
              <span>الإعدادات</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="size-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              title="تبديل الوضع"
            >
              {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* ── 2. MAIN WORKSPACE CANVAS ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        {/* Workstation Top Bar (from Cortex screenshot) */}
        <header className="flex h-12 items-center justify-between px-4 border-b border-border bg-card shrink-0 text-xs">
          {/* Left: Sidebar reopen & Scope Breadcrumbs */}
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="size-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                title="فتح القائمة الجانبية"
              >
                <PanelLeftOpen className="size-4" />
              </button>
            )}

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px]">
              <Link href="/chat" className="hover:text-foreground">
                Local RAG Workstation
              </Link>
              <span>/</span>
              <span className="text-foreground font-semibold">
                {activePath === "/chat"
                  ? "استوديو الاستنطاق"
                  : activePath === "/documents"
                  ? "إدارة المستندات"
                  : activePath === "/dashboard"
                  ? "لوحة التحكم"
                  : "الإعدادات"}
              </span>
            </div>
          </div>

          {/* Center / Right: Mode Controls & Actions */}
          <div className="flex items-center gap-2">
            {/* View Switcher Pills */}
            <div className="hidden sm:flex items-center p-0.5 rounded bg-muted border border-border text-[11px]">
              <Link
                href="/chat"
                className={cn(
                  "px-2.5 py-1 rounded transition-colors",
                  activePath === "/chat" ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                محادثة
              </Link>
              <Link
                href="/documents"
                className={cn(
                  "px-2.5 py-1 rounded transition-colors",
                  activePath === "/documents" ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                المستندات
              </Link>
              <Link
                href="/dashboard"
                className={cn(
                  "px-2.5 py-1 rounded transition-colors",
                  activePath === "/dashboard" ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                التحكم
              </Link>
            </div>

            {/* Upload Button */}
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-7 px-2.5 rounded text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shadow-none cursor-pointer"
            >
              <Plus className="size-3" />
              <span>{uploading ? "جاري الرفع..." : "رفع مستند"}</span>
            </Button>
          </div>
        </header>

        {/* Canvas Body */}
        <main
          className={cn(
            "flex-1 min-h-0 bg-background relative",
            fullBleed ? "overflow-hidden flex flex-col h-full w-full" : "overflow-y-auto"
          )}
        >
          {fullBleed ? (
            children
          ) : (
            <div className="mx-auto max-w-7xl w-full px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          )}
        </main>

        {/* ── 3. BOTTOM STATUS BAR (From Cortex Design) ───────────────── */}
        <footer className="flex h-7 items-center justify-between px-3 border-t border-border bg-card shrink-0 text-[11px] font-mono text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="font-bold text-foreground">Local RAG Workstation 1.0</span>
            <span>•</span>
            <span className="hidden sm:inline">
              {activeCollectionId
                ? `المجموعة: ${collections.find((c) => c.id === activeCollectionId)?.name}`
                : "قاعدة المعرفة: الكل"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[10px]">
            <span className="hidden md:inline">0.12s استجابة Qdrant</span>
            <span>•</span>
            <span>Enter: إرسال</span>
            <span>•</span>
            <span className="hidden sm:inline">Shift+Enter: سطر جديد</span>
          </div>
        </footer>
      </div>

      {/* ── Create Folder Dialog ─────────────────────────────────────── */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent className="max-w-sm text-right">
          <DialogHeader className="text-right">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <FolderPlus className="size-4" />
              <span>إنشاء مجموعة جديدة</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              اكتب اسم المجلد لتصنيف المستندات في شجرة المعرفة
            </DialogDescription>
          </DialogHeader>

          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="مثال: العقود الاستثمارية أو الأبحاث"
            className="h-8 text-xs font-sans rounded"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
            }}
          />

          <div className="flex justify-end gap-2 pt-2 text-xs">
            <Button variant="outline" size="sm" onClick={() => setShowCreateFolder(false)}>
              إلغاء
            </Button>
            <Button size="sm" onClick={handleCreateFolder}>
              إنشاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
