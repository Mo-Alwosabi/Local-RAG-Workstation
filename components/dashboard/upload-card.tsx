"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CloudUpload, FileUp, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { uploadDocuments } from "@/lib/api/upload";
import { useApp } from "@/lib/context/app-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UploadCardProps {
  disabled?: boolean;
  onUploadComplete?: () => void;
}

export function UploadCard({ disabled, onUploadComplete }: UploadCardProps) {
  const { activeCollectionId, refresh } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);

  const isDisabled = disabled || uploading || processing;

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.xlsx', '.csv', '.txt', '.md', '.markdown', '.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.webp', '.json', '.log'];
      const uploadableFiles = Array.from(files).filter((file) => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        return ALLOWED_EXTENSIONS.includes(ext);
      });

      if (uploadableFiles.length === 0) {
        toast.error("يرجى رفع صيغ المستندات المدعومة فقط (PDF, DOCX, TXT, MD, XLSX, CSV).");
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      let slowUploadTimer: NodeJS.Timeout | null = null;
      let toastId: string | number | null = null;

      slowUploadTimer = setTimeout(() => {
        toastId = toast.loading(
          "جاري تقسيم وتضمين المستند واستخراج المتجهات... قد يستغرق المستند الكبير بضع دقائق.",
          { duration: Infinity }
        );
      }, 4000);

      try {
        const results = await uploadDocuments(uploadableFiles, {
          collectionId: activeCollectionId,
          onProgress: ({ progress }) => setUploadProgress(progress),
        });

        if (slowUploadTimer) clearTimeout(slowUploadTimer);
        if (toastId) toast.dismiss(toastId);

        setUploading(false);
        setProcessing(true);

        const alreadyExistsCount = results.filter((doc) => doc.status === "already_exists").length;
        const succeededCount = results.filter((doc) => doc.status === "indexed" || doc.status === "processing").length;
        const failedDocs = results.filter((doc) => doc.status === "failed");

        if (failedDocs.length > 0) {
          const errMsg = failedDocs
            .map((doc) => `${doc.name}: ${doc.error || "فشلت المعالجة"}`)
            .join(", ");
          if (succeededCount > 0) {
            toast.success(`تم رفع ${succeededCount} ملفات بنجاح`);
          }
          throw new Error(errMsg);
        }

        if (alreadyExistsCount > 0 && succeededCount === 0) {
          toast.info("المستند مفهرس وموجود مسبقاً في قاعدة المعرفة");
        } else if (alreadyExistsCount > 0) {
          toast.success(`تم رفع ${succeededCount} ملفات، و${alreadyExistsCount} ملفات مفهرسة مسبقاً`);
        } else {
          toast.success(
            uploadableFiles.length === 1
              ? `تم رفع وفهرسة "${uploadableFiles[0].name}" بنجاح`
              : `تم رفع وفهرسة ${uploadableFiles.length} مستندات بنجاح`
          );
        }

        refresh();
        onUploadComplete?.();
      } catch (err) {
        if (slowUploadTimer) clearTimeout(slowUploadTimer);
        if (toastId) toast.dismiss(toastId);
        toast.error(
          err instanceof Error ? err.message : "فشل في رفع المستندات"
        );
      } finally {
        setUploading(false);
        setProcessing(false);
        setUploadProgress(0);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [activeCollectionId, onUploadComplete, refresh]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!isDisabled) setIsDragging(true);
    },
    [isDisabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (isDisabled || !e.dataTransfer.files.length) return;
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles, isDisabled]
  );

  return (
    <motion.div
      id="upload"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="relative overflow-hidden border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 shadow-2xs">
              <CloudUpload className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">رفع وفهرسة المستندات</CardTitle>
              <CardDescription className="text-xs">
                اسحب الملفات هنا أو تصفح من جهازك لإضافتها لقاعدة المعرفة
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.csv,text/csv,.txt,text/plain,.md,text/markdown,.markdown,text/markdown,.png,image/png,.jpg,image/jpeg,.jpeg,image/jpeg,.tiff,image/tiff,.bmp,image/bmp,.webp,image/webp,.json,application/json,.log,text/plain"
            multiple
            className="hidden"
            disabled={isDisabled}
            onChange={(e) => {
              if (e.target.files?.length) handleFiles(e.target.files);
            }}
          />
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative flex min-h-[190px] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all duration-300",
              isDragging
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-border/80 hover:border-primary/50 hover:bg-muted/30",
              isDisabled && "pointer-events-none opacity-60"
            )}
          >
            <motion.div
              animate={
                isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="mb-3 flex size-14 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-white shadow-xs"
            >
              {uploading || processing ? (
                <Loader2 className="size-7 animate-spin text-white" />
              ) : (
                <FileUp className="size-7" />
              )}
            </motion.div>
            <p className="text-sm font-bold text-foreground">
              {uploading
                ? `جاري الرفع... ${uploadProgress}%`
                : processing
                  ? "جاري تحليل وتقسيم المستند وفهرسته..."
                  : isDragging
                    ? "أفلت الملفات للبدء الفوري"
                    : "اسحب وأفلت الملفات هنا، أو تصفح من جهازك"}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">PDF</span>
              <span className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">DOCX</span>
              <span className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">XLSX</span>
              <span className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">TXT</span>
              <span className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">Markdown</span>
              <span>• حتى 50 ميغابايت لكل ملف</span>
            </div>
            {(uploading || processing) && (
              <Progress
                value={uploading ? uploadProgress : undefined}
                className="mt-4 h-2 w-full max-w-xs"
              />
            )}
            <Button
              className="mt-5 rounded-lg font-semibold gap-2 shadow-xs bg-white hover:bg-neutral-200 text-black border border-neutral-300"
              size="sm"
              disabled={isDisabled}
              onClick={() => inputRef.current?.click()}
            >
              <Sparkles className="size-3.5" />
              <span>اختيار ملفات من الجهاز</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
