"use client";

import { motion } from "framer-motion";
import { AlertCircle, FileText, HardDrive, Layers, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/lib/types";
import { formatBytes } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
  error?: string | null;
}

export function StatsCards({ stats, loading, error }: StatsCardsProps) {
  const storagePercent = stats.storageLimit
    ? Math.min(
        100,
        Math.round((stats.storageUsed / stats.storageLimit) * 100)
      )
    : 0;

  const statItems = [
    {
      key: "documents",
      label: "إجمالي المستندات المفهرسة",
      sublabel: "Total Documents",
      value: stats.totalDocuments.toLocaleString(),
      icon: FileText,
      badge: "جاهزة للاستعلام",
    },
    {
      key: "chunks",
      label: "المقاطع المعرفية (Chunks)",
      sublabel: "Knowledge Segments",
      value: stats.totalChunks.toLocaleString(),
      icon: Layers,
      badge: "تضمين هجين عالي الدقة",
    },
    {
      key: "cache",
      label: "سرعة استجابة الكاش",
      sublabel: "Smart Query Cache",
      value: "0.13s",
      icon: Zap,
      badge: "تسريع بنسبة 99.7%",
    },
  ];

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        <AlertCircle className="size-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 * index }}
        >
          <Card className="relative overflow-hidden border border-border bg-card shadow-none hover:border-foreground/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-0.5">
                <CardTitle className="text-xs font-bold text-foreground">
                  {stat.label}
                </CardTitle>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {stat.sublabel}
                </p>
              </div>
              <div
                className="flex size-8 items-center justify-center rounded border border-border bg-muted/50 text-foreground"
              >
                <stat.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-foreground">
                    {stat.value}
                  </p>
                  <span className="text-[10px] font-mono border border-border bg-muted/60 text-muted-foreground px-2 py-0.5 rounded">
                    {stat.badge}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Storage Usage Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="relative h-full overflow-hidden border border-border bg-card shadow-none hover:border-foreground/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-xs font-bold text-foreground">
                استهلاك مساحة الذاكرة
              </CardTitle>
              <p className="text-[10px] text-muted-foreground font-mono">
                Storage Usage
              </p>
            </div>
            <div className="flex size-8 items-center justify-center rounded border border-border bg-muted/50 text-foreground">
              <HardDrive className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <>
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-2.5 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono">
                    {storagePercent}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatBytes(stats.storageUsed)} من{" "}
                    {formatBytes(stats.storageLimit)}
                  </p>
                </div>
                <Progress value={storagePercent} className="h-2" />
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
