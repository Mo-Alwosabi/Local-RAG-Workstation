"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  FileSpreadsheet,
  FileText,
  FileType,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Document, DocumentStatus } from "@/lib/types";
import { formatBytes, formatRelativeTime } from "@/lib/utils";

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
  processing: { label: "جاري المعالجة", variant: "warning" },
  failed: { label: "فشل التضمين", variant: "destructive" },
  already_exists: { label: "مفهرس مسبقاً", variant: "success" },
};

interface RecentDocumentsProps {
  documents: Document[];
  loading?: boolean;
  error?: string | null;
  limit?: number;
}

export function RecentDocuments({
  documents,
  loading,
  error,
  limit = 5,
}: RecentDocumentsProps) {
  const recent = [...documents]
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    .slice(0, limit);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">أحدث المستندات المفهرسة</CardTitle>
              <CardDescription className="text-xs">
                الملفات المرفوعة مؤخراً وحالة إتاحتها للاستعلام الفوري
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-neutral-300 hover:text-white gap-1"
              asChild
            >
              <Link href="/documents">
                <span>عرض الكل</span>
                <ArrowLeft className="size-3.5" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {error ? (
            <div className="flex items-center gap-3 px-6 py-8 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : loading ? (
            <div className="space-y-4 px-6 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="px-6 py-8 text-center text-xs text-muted-foreground">
              لا توجد مستندات بعد. قم برفع أول مستند PDF للبدء.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {recent.map((doc, index) => {
                const Icon = typeIcons[doc.type] ?? FileText;
                const status = statusConfig[doc.status];

                return (
                  <motion.li
                    key={doc.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
                    className="flex items-center justify-between gap-4 px-6 py-3.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground" title={doc.name}>
                          {doc.name}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="font-mono">{doc.type}</span>
                          <span>•</span>
                          <span>{formatBytes(doc.size)}</span>
                          <span>•</span>
                          <span className="text-neutral-300 font-mono">{doc.chunks} chunks</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="size-3" />
                        <span>{formatRelativeTime(doc.uploadedAt)}</span>
                      </div>

                      <Badge variant={status.variant} className="text-[11px]">
                        {status.label}
                      </Badge>

                      <Link href="/chat">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-200 transition-colors"
                        >
                          <MessageSquare className="size-3.5" />
                          <span className="hidden sm:inline">استجواب</span>
                        </Button>
                      </Link>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
