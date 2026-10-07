"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Terminal,
  Cpu,
  Layers,
  Search,
  Send,
  CornerDownLeft,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Scenario {
  id: string;
  category: string;
  docTitle: string;
  docPages: number;
  query: string;
  answer: string;
  sourceDoc: string;
  pageNumber: number;
  paragraph: number;
  confidence: string;
  latency: string;
  excerpt: string;
}

const scenarios: Scenario[] = [
  {
    id: "legal",
    category: "عقد استثماري وقانوني",
    docTitle: "عقد_الاستثمار_المشترك_2026_النسخة_النهائية.pdf",
    docPages: 86,
    query: "ما هي التزامات الطرف الثاني في حال التخارج المبكر، وما هي نسبة التعويض المشروطة؟",
    answer:
      "يلتزم الطرف الثاني بإشعار خطي مسبق لا يقل عن 60 يوماً قبل تاريخ التخارج. ووفقاً لأحكام المادة (14) فقرة (ب)، يتحمل الطرف المتخارج تعويضاً قدره 12.5% من إجمالي رأس المال المستثمر ما لم يكن التخارج ناتجاً عن إخلال جوهري من الطرف الأول.",
    sourceDoc: "عقد_الاستثمار_المشترك_2026.pdf",
    pageNumber: 38,
    paragraph: 3,
    confidence: "99.8%",
    latency: "110ms",
    excerpt: "المادة 14.2 (شروط التخارج): «...يلتزم الطرف الثاني بإشعار خطي لا يقل عن ستين يوماً، ويلتزم بسداد تعويض بنسبة 12.5% من حصة رأس المال...»",
  },
  {
    id: "finance",
    category: "تقرير مالي وميزانية",
    docTitle: "التقرير_المالي_السنوي_الموحد_2025_المراجع.pdf",
    docPages: 142,
    query: "قارن صافي التدفقات النقدية التشغيلية بين الربع الثالث والرابع، وما هو السبب الرئيسي لتغير الأرباح؟",
    answer:
      "ارتفع صافي التدفق النقدي التشغيلي من 24.8 مليون ريال في الربع الثالث إلى 38.4 مليون ريال في الربع الرابع بنمو 54.8%. يعود السبب الرئيسي بحسب إيضاح (9) إلى تحصيل مستحقات عقود حكومية مؤجلة وتخفيض تكاليف سلاسل الإمداد بنسبة 18%.",
    sourceDoc: "التقرير_المالي_السنوي_2025.pdf",
    pageNumber: 74,
    paragraph: 2,
    confidence: "99.5%",
    latency: "135ms",
    excerpt: "إيضاح 9 (قائمة التدفقات النقدية): «...بلغ صافي النقد من الأنشطة التشغيلية 38.4 مليون ريال مقارنة بـ 24.8 مليون للربع السابق، مدفوعاً بتحصيل ذمم مدينة استراتيجية...»",
  },
  {
    id: "sovereign",
    category: "امتثال سيادي (PDPL)",
    docTitle: "سياسة_إدارة_البيانات_والأمن_السيبراني_المؤسسي.pdf",
    docPages: 64,
    query: "هل يسمح النظام بنقل سجلات الهوية أو البيانات المالية الحساسة خارج مراكز البيانات الوطنية؟",
    answer:
      "يحظر النظام بشكل قطعي نقل أي سجلات تخص الهوية الوطنية أو البيانات المالية خارج الحدود الجغرافية للمملكة. وفقاً للبند (6.1)، تعمل المنظومة كلياً داخل بيئة معزولة (Air-Gapped) دون أي اعتمادية على واجهات خارجية أو خوادم سحابية أجنبية.",
    sourceDoc: "سياسة_الأمن_السيبراني_المؤسسي.pdf",
    pageNumber: 19,
    paragraph: 1,
    confidence: "100%",
    latency: "95ms",
    excerpt: "البند 6.1 (سيادة المعالجة): «...تخضع كافة أصول البيانات لقيد السيادة الإقليمية، وتتم معالجة التضمينات والنماذج داخل بيئة On-Premises مغلقة ودون اتصال خارجي...»",
  },
];

export function Q9InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<string>("legal");
  const [customQuery, setCustomQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const current = scenarios.find((s) => s.id === activeTab) || scenarios[0];

  const handleSelectScenario = (id: string) => {
    if (id === activeTab) return;
    setIsProcessing(true);
    setActiveTab(id);
    setCustomQuery("");
    setTimeout(() => {
      setIsProcessing(false);
    }, 280);
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 350);
  };

  return (
    <div id="demo" className="w-full rounded-3xl border border-border/80 bg-card/70 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl overflow-hidden relative transition-all">
      {/* Top Header & Live Telemetry Pill */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/70">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20">
            <Terminal className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-foreground tracking-wider uppercase">
                Q9 Cognitive Console // v4.2
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-500 border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Air-Gapped Node Online
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              تجربة حية لاستنطاق الوثائق الرسمية والتحقق من مصادر الأدلة في أجزاء من الثانية
            </p>
          </div>
        </div>

        {/* Sector Preset Switches */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border/60">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(sc.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === sc.id
                  ? "bg-background text-foreground shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {sc.category}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Search / Prompt Input Bar */}
      <div className="pt-6 pb-2">
        <form onSubmit={handleQuerySubmit} className="relative flex items-center">
          <div className="absolute right-4 text-muted-foreground pointer-events-none">
            <Search className="size-4" />
          </div>
          <Input
            value={customQuery || current.query}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="اسأل محرك Q9 عن أي بند أو التزام أو رقم في المستند..."
            className="h-13 pr-11 pl-28 rounded-2xl bg-background/80 border-border/80 text-xs sm:text-sm font-medium focus-visible:ring-primary shadow-inner"
          />
          <div className="absolute left-2">
            <Button
              type="submit"
              size="sm"
              className="h-9 px-4 rounded-xl font-bold text-xs bg-primary text-white hover:bg-primary/90 transition-all gap-1.5 cursor-pointer"
            >
              <Sparkles className="size-3.5" />
              <span>استنطاق بالدليل</span>
            </Button>
          </div>
        </form>

        {/* Preset Prompt Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 text-xs">
          <span className="text-muted-foreground text-[11px] font-semibold">أسئلة جاهزة للتجربة:</span>
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectScenario(s.id)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer truncate max-w-[280px] sm:max-w-none ${
                activeTab === s.id
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "bg-background/60 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {s.query}
            </button>
          ))}
        </div>
      </div>

      {/* Main Console Workspace */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Start Column: Target Document & Evidence */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-border/80 bg-background/80 p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono font-semibold">TARGET REPOSITORY</span>
              <span className="font-mono text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                QDRANT // DENSE+SPARSE
              </span>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <FileText className="size-5" />
              </div>
              <div className="space-y-0.5 text-right overflow-hidden">
                <p className="text-xs font-bold text-foreground truncate font-mono" dir="ltr">
                  {current.docTitle}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                  <span>{current.docPages} صفحة</span>
                  <span>•</span>
                  <span>تشفير AES-256</span>
                  <span>•</span>
                  <span>محلي 100% On-Prem</span>
                </div>
              </div>
            </div>

            {/* Extracted Grounding Chunk */}
            <div className="pt-3 border-t border-border/60 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                <span>الدليل المستخرج من الأصل (Grounding Chunk)</span>
                <span className="font-mono text-emerald-500 text-[10px] font-bold">
                  ص {current.pageNumber} • فقرة {current.paragraph}
                </span>
              </div>
              <p className="text-xs text-foreground/90 bg-muted/30 p-3.5 rounded-xl border border-border/50 leading-relaxed font-mono">
                {current.excerpt}
              </p>
            </div>
          </div>

          {/* Telemetry Strip */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-border/70 bg-background/60 p-3 text-center">
              <span className="text-[10px] text-muted-foreground font-semibold block">الدقة القطعية</span>
              <span className="font-mono text-base font-black text-emerald-500">{current.confidence}</span>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 p-3 text-center">
              <span className="text-[10px] text-muted-foreground font-semibold block">زمن الاستجابة</span>
              <span className="font-mono text-base font-black text-blue-500">{current.latency}</span>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 p-3 text-center">
              <span className="text-[10px] text-muted-foreground font-semibold block">معدل الهلوسة</span>
              <span className="font-mono text-base font-black text-cyan-500">0.0%</span>
            </div>
          </div>
        </div>

        {/* Right/End Column: Synthesis & Live Evidence Answer */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[280px] flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-background/60 space-y-3"
              >
                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono text-muted-foreground">
                  جاري استرجاع المتجهات الدلالية والتحقق من الأدلة...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Synthesized Response Box */}
                <div className="rounded-2xl border border-border/90 bg-background/95 p-6 text-right space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <Sparkles className="size-4 text-primary" />
                      <span>إجابة نظام Q9 المدعومة بالأدلة القطعية</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                      <CheckCircle2 className="size-3.5" />
                      موثق بالدليل
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-foreground/95 leading-relaxed font-normal">
                    {current.answer}
                  </p>

                  {/* Footnote Citation */}
                  <div className="pt-3.5 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-semibold text-foreground">المصدر المعتمد:</span>
                      <span className="font-mono text-[11px] bg-muted px-2.5 py-1 rounded-md text-foreground/90 font-medium" dir="ltr">
                        {current.sourceDoc} (ص {current.pageNumber})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-primary text-[11px] font-bold">
                      <ShieldCheck className="size-3.5" />
                      <span>ضمان عدم الهلوسة ملزم 100%</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Link */}
                <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
                  <span>هل تريد استنطاق مستندات جهتك الخاصة؟</span>
                  <a href="#contact" className="font-bold text-primary hover:underline flex items-center gap-1">
                    <span>احجز معسكر تجربة 14 يوماً</span>
                    <ArrowRight className="size-3 rotate-180" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
