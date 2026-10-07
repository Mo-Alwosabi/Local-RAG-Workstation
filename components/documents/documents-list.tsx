"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  FileType,
  FolderOpen,
  FolderPlus,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { deleteDocument } from "@/lib/api/documents";
import { uploadDocuments } from "@/lib/api/upload";
import { createCollection, deleteCollection } from "@/lib/api/collections";
import { useApp } from "@/lib/context/app-context";
import { useDocuments } from "@/lib/hooks/use-documents";
import { useCollections } from "@/lib/hooks/use-collections";
import type { DocumentStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatBytes, formatRelativeTime } from "@/lib/utils";

const typeIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  Markdown: FileType,
  Spreadsheet: FileSpreadsheet,
  Document: FileText,
  Text: FileType,
};

const statusConfig: Record<
  DocumentStatus,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  indexed: { label: "مفهرس وجاهز", variant: "success" },
  processing: { label: "جاري الفهرسة", variant: "warning" },
  failed: { label: "فشل التحليل", variant: "destructive" },
  already_exists: { label: "مفهرس مسبقاً", variant: "success" },
};

export function DocumentsList() {
  const { activeCollectionId, setActiveCollectionId, refresh } = useApp();
  const { documents, loading, error, refetch } = useDocuments({
    pollProcessing: true,
  });
  const { collections, refetch: refetchCollections } = useCollections();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"documents" | "collections">("documents");

  // Upload State
  const [showUpload, setShowUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation State
  const [docToDelete, setDocToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Collection Creation State
  const [newCollectionName, setNewCollectionName] = useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);

  // Handle Upload
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const ALLOWED = [".pdf", ".docx", ".pptx", ".xlsx", ".csv", ".txt", ".md", ".json"];
      const uploadable = Array.from(files).filter((f) => {
        const ext = "." + f.name.split(".").pop()?.toLowerCase();
        return ALLOWED.includes(ext);
      });

      if (uploadable.length === 0) {
        toast.error("يرجى اختيار ملفات بالصيغ المدعومة (PDF, DOCX, TXT, MD, XLSX)");
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      try {
        const results = await uploadDocuments(uploadable, {
          collectionId: activeCollectionId,
          onProgress: ({ progress }) => setUploadProgress(progress),
        });

        const succeeded = results.filter((d) => d.status === "indexed" || d.status === "processing").length;
        const already = results.filter((d) => d.status === "already_exists").length;
        const failed = results.filter((d) => d.status === "failed").length;

        if (failed > 0) {
          toast.error(`فشل في معالجة ${failed} مستندات.`);
        } else if (already > 0 && succeeded === 0) {
          toast.info("المستند مفهرس وموجود مسبقاً في قاعدة المعرفة.");
        } else {
          toast.success(
            uploadable.length === 1
              ? `تم رفع وفهرسة "${uploadable[0].name}" بنجاح`
              : `تم رفع وفهرسة ${uploadable.length} مستندات بنجاح`
          );
        }

        refresh();
        refetch();
        setShowUpload(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "فشل أثناء رفع المستندات");
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [activeCollectionId, refresh, refetch]
  );

  // Confirm and Execute Delete
  const confirmDelete = async () => {
    if (!docToDelete) return;
    setDeleting(true);
    try {
      await deleteDocument(docToDelete.id);
      toast.success(`تم حذف "${docToDelete.name}" نهائياً من قاعدة المعرفة`);
      refresh();
      refetch();
      setDocToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل في حذف المستند");
    } finally {
      setDeleting(false);
    }
  };

  // Create Collection
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    setCreatingCollection(true);
    try {
      const col = await createCollection(newCollectionName.trim());
      toast.success(`تم إنشاء المجموعة "${col.name}" بنجاح`);
      setNewCollectionName("");
      setShowCreateCollection(false);
      refetchCollections();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل في إنشاء المجموعة");
    } finally {
      setCreatingCollection(false);
    }
  };

  // Delete Collection
  const handleDeleteCollection = async (id: string, name: string) => {
    try {
      await deleteCollection(id);
      toast.success(`تم حذف المجموعة "${name}"`);
      if (activeCollectionId === id) setActiveCollectionId(null);
      refetchCollections();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل في حذف المجموعة");
    }
  };

  // Filter Documents
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "pdf" && doc.type.toLowerCase() === "pdf") ||
      (typeFilter === "word" && (doc.type.toLowerCase().includes("word") || doc.name.endsWith(".docx"))) ||
      (typeFilter === "text" && (doc.type.toLowerCase() === "text" || doc.name.endsWith(".txt") || doc.name.endsWith(".md"))) ||
      (typeFilter === "indexed" && doc.status === "indexed");
    const matchesCollection = !activeCollectionId || doc.collectionId === activeCollectionId;
    return matchesSearch && matchesType && matchesCollection;
  });

  return (
    <div className="space-y-6">
      {/* ── Top Overview Bar & Action Buttons ───────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Navigation Tabs (Documents vs Collections) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/60">
          <button
            onClick={() => setActiveTab("documents")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
              activeTab === "documents"
                ? "bg-neutral-900 text-white border border-neutral-800 shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="size-3.5 text-neutral-300" />
            <span>المستندات المفهرسة ({documents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("collections")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
              activeTab === "collections"
                ? "bg-neutral-900 text-white border border-neutral-800 shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FolderOpen className="size-3.5 text-neutral-300" />
            <span>المجموعات والمجلدات ({collections.length})</span>
          </button>
        </div>

        {/* Upload & Refresh Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
            className="h-9 px-3 text-xs gap-1.5 border-neutral-800 hover:bg-neutral-900 text-neutral-200"
            title="تحديث قائمة المستندات"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">تحديث</span>
          </Button>

          {activeTab === "documents" ? (
            <Button
              size="sm"
              onClick={() => setShowUpload((prev) => !prev)}
              className="h-9 px-4 text-xs font-semibold gap-2 bg-white text-black hover:bg-neutral-200 rounded-lg shadow-none cursor-pointer"
            >
              <UploadCloud className="size-4" />
              <span>{showUpload ? "إغلاق نافذة الرفع" : "رفع مستند جديد"}</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setShowCreateCollection(true)}
              className="h-9 px-4 text-xs font-bold gap-2 bg-white text-black hover:bg-neutral-200 rounded-lg shadow-sm cursor-pointer"
            >
              <FolderPlus className="size-4" />
              <span>إنشاء مجموعة جديدة</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Collapsible Interactive Upload Dropzone ───────────────────── */}
      <AnimatePresence>
        {showUpload && activeTab === "documents" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <Card className="border-2 border-dashed border-neutral-700 bg-neutral-950 p-6 text-center transition-all">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md,.json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFiles(e.target.files);
                  }
                }}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFiles(e.dataTransfer.files);
                  }
                }}
                className={cn(
                  "py-8 px-4 rounded-xl transition-all flex flex-col items-center justify-center space-y-3",
                  isDragging ? "bg-neutral-900 scale-[1.01]" : "hover:bg-neutral-900/50"
                )}
              >
                <div className="flex size-14 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-white shadow-inner">
                  {uploading ? (
                    <Loader2 className="size-7 animate-spin text-white" />
                  ) : (
                    <UploadCloud className="size-7" />
                  )}
                </div>

                <div className="space-y-1 text-center">
                  <p className="text-sm font-bold text-foreground">
                    {uploading
                      ? "جاري رفع وتقسيم المستندات وتوليد المتجهات الدلالية..."
                      : "اسحب الملفات وأفلتها هنا، أو اضغط للاختيار"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    صيغ الملفات المدعومة: PDF, DOCX, XLSX, TXT, MD (معالجة محلية On-Premises)
                  </p>
                </div>

                {uploading && (
                  <div className="w-full max-w-md space-y-2 pt-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <span className="text-xs font-mono font-semibold text-primary">
                      {uploadProgress}%
                    </span>
                  </div>
                )}

                {!uploading && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-5 text-xs font-bold rounded-xl border-border/80"
                  >
                    استعراض الملفات من جهازك
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DOCUMENTS VIEW ───────────────────────────────────────────── */}
      {activeTab === "documents" && (
        <Card className="border-border/80 shadow-xs">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "كافة الملفات" },
                  { id: "pdf", label: "PDF" },
                  { id: "word", label: "Word (.docx)" },
                  { id: "text", label: "نصوص (.txt/.md)" },
                  { id: "indexed", label: "مفهرس فقط" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTypeFilter(tab.id)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                      typeFilter === tab.id
                        ? "bg-neutral-900 text-white border border-neutral-700 shadow-2xs"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}

                {activeCollectionId && (
                  <div className="flex items-center gap-1.5 bg-muted text-foreground border border-border px-2.5 py-0.5 rounded text-xs font-mono mr-2">
                    <span>مجموعة: {collections.find((c) => c.id === activeCollectionId)?.name}</span>
                    <button
                      onClick={() => setActiveCollectionId(null)}
                      className="size-3.5 flex items-center justify-center hover:opacity-75 cursor-pointer"
                      title="إلغاء التصفية"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="absolute right-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث في أسماء الملفات..."
                  className="pr-9 h-9 text-xs rounded-xl"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            {error ? (
              <div className="flex items-center gap-3 px-6 py-8 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : loading ? (
              <div className="space-y-4 px-6 py-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="size-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="px-6 py-16 text-center space-y-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
                  <FileText className="size-6" />
                </div>
                <p className="text-sm font-bold text-foreground">
                  {search || typeFilter !== "all"
                    ? "لا توجد ملفات مطابقة لبحثك أو تصنيفك"
                    : "قاعدة المعرفة فارغة حالياً"}
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {search || typeFilter !== "all"
                    ? "جرب تعديل كلمة البحث أو تغيير نوع الفلتر."
                    : "ابدأ برفع أول مستند لتتم فهرسته متجهياً والبدء في استنطاقه."}
                </p>
                {!search && typeFilter === "all" && (
                  <Button
                    size="sm"
                    onClick={() => setShowUpload(true)}
                    className="h-9 px-4 text-xs font-bold gap-1.5 mt-2"
                  >
                    <UploadCloud className="size-4" />
                    <span>رفع مستندك الأول</span>
                  </Button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {filteredDocs.map((doc, index) => {
                  const Icon = typeIcons[doc.type] ?? FileText;
                  const status = statusConfig[doc.status];

                  return (
                    <motion.li
                      key={doc.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-foreground" title={doc.name}>
                            {doc.name}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="font-mono">{doc.type}</span>
                            <span>•</span>
                            <span>{formatBytes(doc.size)}</span>
                            <span>•</span>
                            <span className="text-neutral-300 font-mono">
                              {doc.chunks} chunks
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:flex items-center gap-1">
                              <Clock className="size-3" />
                              {formatRelativeTime(doc.uploadedAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={status.variant} className="text-[11px] font-semibold">
                          {status.label}
                        </Badge>

                        {/* Direct Interrogation to Chat */}
                        <Link href={`/chat?doc=${encodeURIComponent(doc.id)}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-200 transition-all rounded-lg"
                            title="استجواب هذا المستند في استوديو المحادثة"
                          >
                            <MessageSquare className="size-3.5 text-neutral-300" />
                            <span className="hidden sm:inline">استجواب</span>
                          </Button>
                        </Link>

                        {/* Safe Delete with Confirmation */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDocToDelete({ id: doc.id, name: doc.name })}
                          title="حذف المستند"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── COLLECTIONS VIEW ─────────────────────────────────────────── */}
      {activeTab === "collections" && (
        <Card className="border-border/80 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold">المجموعات والمجلدات المعرفية</CardTitle>
            <CardDescription className="text-xs">
              تنظيم المستندات في مجلدات موضوعية (مثل: العقود، التقارير السنوية، الأبحاث) لحصر البحث فيها
            </CardDescription>
          </CardHeader>
          <CardContent>
            {collections.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <FolderOpen className="size-10 text-muted-foreground mx-auto" />
                <p className="text-sm font-bold text-foreground">لا توجد مجموعات بعد</p>
                <p className="text-xs text-muted-foreground">
                  أنشئ أول مجموعة لتنظيم وتصنيف ملفاتك وقواعد بياناتك
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowCreateCollection(true)}
                  className="h-9 px-4 text-xs font-bold gap-1.5"
                >
                  <Plus className="size-3.5" />
                  <span>إنشاء أول مجموعة</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((col) => {
                  const isCurrentActive = activeCollectionId === col.id;
                  return (
                    <div
                      key={col.id}
                      className={cn(
                        "rounded-xl border p-5 transition-all space-y-3 flex flex-col justify-between",
                        isCurrentActive
                          ? "border-neutral-500 bg-neutral-900/60 ring-1 ring-neutral-500"
                          : "border-border/80 bg-card hover:border-neutral-700"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex size-9 items-center justify-center rounded border border-neutral-800 bg-neutral-900 text-neutral-200">
                            <FolderOpen className="size-4" />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteCollection(col.id, col.name)}
                            title="حذف المجموعة"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                        <h4 className="font-bold text-sm text-foreground mt-3">{col.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {col.documentCount} مستندات مرتبطة
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                        <Button
                          size="sm"
                          variant={isCurrentActive ? "default" : "outline"}
                          className="h-8 text-xs w-full font-semibold rounded-lg"
                          onClick={() => {
                            if (isCurrentActive) {
                              setActiveCollectionId(null);
                            } else {
                              setActiveCollectionId(col.id);
                              setActiveTab("documents");
                            }
                          }}
                        >
                          {isCurrentActive ? "المجموعة محددة (إلغاء)" : "تصفية المستندات بها"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Delete Confirmation Dialog ───────────────────────────────── */}
      <Dialog
        open={Boolean(docToDelete)}
        onOpenChange={(open) => !open && setDocToDelete(null)}
      >
        <DialogContent className="max-w-md text-right">
          <DialogHeader className="text-right">
            <DialogTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertCircle className="size-5" />
              <span>تأكيد حذف المستند</span>
            </DialogTitle>
            <DialogDescription className="text-xs pt-1 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف المستند التالي نهائياً من قاعدة المعرفة وقاعدة المتجهات؟
            </DialogDescription>
          </DialogHeader>

          {docToDelete && (
            <div className="my-3 p-3 rounded-xl bg-muted/60 border border-border/60 font-mono text-xs font-bold text-foreground break-all">
              📄 {docToDelete.name}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={deleting}
              onClick={() => setDocToDelete(null)}
              className="text-xs rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={confirmDelete}
              className="text-xs font-bold gap-1.5 rounded-xl cursor-pointer"
            >
              {deleting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              <span>تأكيد الحذف النهائي</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Create Collection Dialog ─────────────────────────────────── */}
      <Dialog
        open={showCreateCollection}
        onOpenChange={(open) => !open && setShowCreateCollection(false)}
      >
        <DialogContent className="max-w-md text-right">
          <DialogHeader className="text-right">
            <DialogTitle className="flex items-center gap-2 text-base">
              <FolderPlus className="size-5 text-primary" />
              <span>إنشاء مجموعة معرفية جديدة</span>
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              اكتب اسم المجموعة لتصنيف المستندات وتسهيل البحث بداخلها
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-3">
            <Input
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="مثال: عقود الاستثمار 2026 أو اللوائح الداخلية"
              className="h-10 text-xs rounded-xl"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateCollection();
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateCollection(false)}
              className="text-xs rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              size="sm"
              disabled={!newCollectionName.trim() || creatingCollection}
              onClick={handleCreateCollection}
              className="text-xs font-bold gap-1.5 rounded-xl cursor-pointer"
            >
              {creatingCollection ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
              <span>إنشاء المجموعة</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
