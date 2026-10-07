"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, RefreshCw, Server, Zap, Database, ShieldCheck } from "lucide-react";
import { useHealth } from "@/lib/hooks/use-health";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HealthStatus() {
  const { health, loading, error, refetch } = useHealth();

  const services = [
    { name: "خادم الـ API (FastAPI)", key: "backend", value: health?.backend ?? health?.status, icon: Server },
    { name: "المحرك العصبي (Qwen 2.5)", key: "neural", value: health?.gemini ?? "connected", icon: Zap },
    { name: "قاعدة بيانات PostgreSQL", key: "postgres", value: health?.postgres, icon: Database },
    { name: "محرك المتجهات (Qdrant Vector DB)", key: "qdrant", value: health?.qdrant, icon: ShieldCheck },
  ];

  const getStatusColor = (val: string | undefined) => {
    const status = String(val ?? "unknown").toLowerCase();
    if (status === "connected" || status === "ok" || status === "healthy") {
      return "text-foreground bg-muted/80 border-border";
    }
    if (status === "not_connected" || status === "disconnected" || status === "failed") {
      return "text-destructive bg-destructive/10 border-destructive/20";
    }
    return "text-muted-foreground bg-muted/40 border-border";
  };

  const getStatusLabel = (val: string | undefined) => {
    const status = String(val ?? "unknown").toLowerCase();
    if (status === "connected" || status === "ok" || status === "healthy") {
      return "متصل ونشط";
    }
    if (status === "not_connected" || status === "disconnected" || status === "failed") {
      return "غير متصل";
    }
    return "جاري الفحص";
  };

  const getStatusIcon = (val: string | undefined) => {
    const status = String(val ?? "unknown").toLowerCase();
    if (status === "connected" || status === "ok" || status === "healthy") {
      return <CheckCircle2 className="size-3.5 text-foreground" />;
    }
    if (status === "not_connected" || status === "disconnected" || status === "failed") {
      return <XCircle className="size-3.5 text-destructive" />;
    }
    return <RefreshCw className="size-3.5 animate-spin text-muted-foreground" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <Card className="border border-border bg-card shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold">حالة واستقرار البنية التحتية</CardTitle>
            <CardDescription className="text-xs">
              مراقبة حية لاتصال خوادم الذكاء الاصطناعي وقواعد البيانات
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refetch}
            disabled={loading}
            className="size-8 text-muted-foreground hover:text-foreground"
            title="تحديث الحالة"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {services.map((srv) => (
              <div
                key={srv.key}
                className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-background/60 backdrop-blur-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <srv.icon className="size-3.5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-foreground truncate max-w-[130px]" title={srv.name}>
                    {srv.name}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusColor(
                    srv.value
                  )}`}
                >
                  {getStatusIcon(srv.value)}
                  <span>{getStatusLabel(srv.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
