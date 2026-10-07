"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Sliders,
  Cpu,
  Layers,
  Zap,
  Save,
  XCircle,
} from "lucide-react";
import { getApiBase } from "@/lib/api/client";
import { useHealth } from "@/lib/hooks/use-health";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const isHealthy =
    normalized.includes("connected") ||
    normalized.includes("healthy") ||
    normalized.includes("ok") ||
    normalized === "true";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-mono border",
        isHealthy
          ? "bg-neutral-900 text-neutral-200 border-neutral-700"
          : "bg-neutral-950 text-neutral-400 border-neutral-800"
      )}
    >
      {isHealthy ? (
        <CheckCircle2 className="size-3 text-neutral-200" />
      ) : (
        <XCircle className="size-3 text-neutral-400" />
      )}
      <span>{isHealthy ? "ONLINE / ACTIVE" : status.toUpperCase()}</span>
    </span>
  );
}

export function SettingsPanel() {
  const { health, loading, error, refetch } = useHealth();
  const [urlInput, setUrlInput] = useState("");
  const [similarityThreshold, setSimilarityThreshold] = useState("0.70");
  const [topK, setTopK] = useState("5");
  const [chunkSize, setChunkSize] = useState("1000");
  const [chunkOverlap, setChunkOverlap] = useState("200");

  useEffect(() => {
    setUrlInput(getApiBase());
    const savedThreshold = localStorage.getItem("rag_similarity_threshold");
    if (savedThreshold) setSimilarityThreshold(savedThreshold);
    const savedTopK = localStorage.getItem("rag_top_k");
    if (savedTopK) setTopK(savedTopK);
    const savedChunkSize = localStorage.getItem("rag_chunk_size");
    if (savedChunkSize) setChunkSize(savedChunkSize);
    const savedOverlap = localStorage.getItem("rag_chunk_overlap");
    if (savedOverlap) setChunkOverlap(savedOverlap);
  }, []);

  const handleSaveUrl = () => {
    if (!urlInput.trim()) return;
    localStorage.setItem("rag_backend_url", urlInput.trim());
    toast.success("تم تحديث رابط خادم الـ API بنجاح");
    refetch();
  };

  const handleSaveRagConfig = () => {
    localStorage.setItem("rag_similarity_threshold", similarityThreshold);
    localStorage.setItem("rag_top_k", topK);
    localStorage.setItem("rag_chunk_size", chunkSize);
    localStorage.setItem("rag_chunk_overlap", chunkOverlap);
    toast.success("تم حفظ معلمات الاسترجاع الدلالي (RAG) بنجاح");
  };

  const services = [
    {
      key: "backend",
      label: "خادم الـ API (FastAPI)",
      sub: "خادم المعالجة وتدفق الاستعلامات",
      icon: Server,
      status: health?.backend ?? health?.status ?? "unknown",
    },
    {
      key: "neural",
      label: "المحرك العصبي (LM Studio)",
      sub: "نموذج Qwen 2.5 المحلي لتوليد الإجابات",
      icon: Zap,
      status: health?.gemini ?? "connected",
    },
    {
      key: "qdrant",
      label: "محرك المتجهات (Qdrant DB)",
      sub: "قاعدة بيانات المتجهات الدلالية",
      icon: ShieldCheck,
      status: health?.qdrant ?? "unknown",
    },
    {
      key: "postgres",
      label: "قاعدة البيانات (PostgreSQL)",
      sub: "تخزين المستندات وسجلات المحادثة",
      icon: Database,
      status: health?.postgres ?? "unknown",
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1 border-destructive/30 hover:bg-destructive/10 text-destructive"
            onClick={() => refetch()}
          >
            <RefreshCw className="size-3" />
            <span>إعادة المحاولة</span>
          </Button>
        </div>
      )}

      {/* ── Services Health Grid ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">حالة الخدمات والمكونات الأساسية</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>تحديث الفحص</span>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-border/80 shadow-2xs hover:border-neutral-600 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-foreground">
                          {service.label}
                        </CardTitle>
                        <CardDescription className="text-[11px]">
                          {service.sub}
                        </CardDescription>
                      </div>
                    </div>
                    {loading ? (
                      <Skeleton className="h-6 w-20 rounded-full" />
                    ) : (
                      <StatusBadge status={service.status} />
                    )}
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── RAG & Vector Engine Parameters ──────────────────────────── */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-neutral-300" />
            <CardTitle className="text-base font-bold">معلمات الاسترجاع الدلالي (RAG Tuning)</CardTitle>
          </div>
          <CardDescription className="text-xs">
            ضبط حساسية البحث الدلالي وحجم تقطيع المستندات وعدد النتائج المرجعية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                حد التطابق الأدنى (Similarity Threshold)
              </label>
              <Input
                type="number"
                step="0.05"
                min="0.1"
                max="1.0"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(e.target.value)}
                className="h-9 text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                الحد الأدنى لدرجة تشابه الفقرة مع السؤال (الموصى به: 0.65 إلى 0.75)
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                عدد النتائج المرجعية (Top K Chunks)
              </label>
              <Input
                type="number"
                min="1"
                max="20"
                value={topK}
                onChange={(e) => setTopK(e.target.value)}
                className="h-9 text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                أقصى عدد من الفقرات ذات الصلة التي يتم تمريرها للمحرك التوليدي (الافتراضي: 5)
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                حجم المقطع المعرفي (Chunk Size بالرموز)
              </label>
              <Input
                type="number"
                step="100"
                min="200"
                max="4000"
                value={chunkSize}
                onChange={(e) => setChunkSize(e.target.value)}
                className="h-9 text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                طول المقطع المستخلص من المستند عند التضمين (الافتراضي: 1000)
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                التداخل بين المقاطع (Chunk Overlap)
              </label>
              <Input
                type="number"
                step="50"
                min="0"
                max="1000"
                value={chunkOverlap}
                onChange={(e) => setChunkOverlap(e.target.value)}
                className="h-9 text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                عدد الأحرف المتداخلة لمنع انقطاع المعنى بين المقاطع (الافتراضي: 200)
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              onClick={handleSaveRagConfig}
              className="h-9 px-4 text-xs gap-1.5 bg-white hover:bg-neutral-200 text-black font-bold rounded-lg"
            >
              <Save className="size-3.5" />
              <span>حفظ معلمات الاسترجاع</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Environment & Backend URL ────────────────────────────────── */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold">إعدادات الاتصال والبيئة</CardTitle>
          <CardDescription className="text-xs">
            تكوين عنوان خادم الـ API وبيئة التشغيل المحلية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {loading ? (
            <Skeleton className="h-24 w-full rounded-xl" />
          ) : (
            <>
              <div className="flex flex-col gap-2 border-b border-border/60 pb-4">
                <span className="text-xs font-semibold text-foreground">
                  رابط خادم الـ API (API Base URL)
                </span>
                <div className="flex gap-2 max-w-md">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="http://localhost:8000"
                    className="font-mono text-xs h-9"
                  />
                  <Button size="sm" onClick={handleSaveUrl} className="h-9 px-4 text-xs font-bold rounded-lg bg-white hover:bg-neutral-200 text-black">
                    حفظ
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-1 text-xs">
                <div>
                  <span className="text-muted-foreground block">بيئة التشغيل:</span>
                  <span className="font-semibold text-foreground">
                    {health?.environment ?? "Local Development"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">مزود الذكاء الاصطناعي:</span>
                  <span className="font-semibold text-foreground font-mono">
                    Local LM Studio (Qwen)
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">محرك التضمين (Embedding):</span>
                  <span className="font-semibold text-foreground font-mono">
                    nomic-embed-text
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
