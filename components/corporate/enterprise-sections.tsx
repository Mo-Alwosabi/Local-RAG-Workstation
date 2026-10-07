"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  Cloud,
  FileCheck2,
  HardDrive,
  HelpCircle,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Network,
  Phone,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Card3D } from "@/components/ui/card-3d";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ── 1. Security & Privacy Guarantees Bar ──────────────────────────────────
export function EnterpriseComplianceBar() {
  const certs = [
    {
      title: "مجاني 100% وبلا قيود",
      desc: "متاح للاستخدام الفوري لجميع الباحثين والمؤسسات",
      badge: "مبادرة Q9 المجانية",
    },
    {
      title: "أمان محلي On-Premises",
      desc: "معالجة داخل جهازك وشبكتك دون خروج بياناتك",
      badge: "أمان سيادي",
    },
    {
      title: "تعهد عدم التدريب (Zero-Training)",
      desc: "بياناتك ومستنداتك لا تُستخدم نهائياً في تدريب النماذج",
      badge: "خصوصية مطلقة",
    },
    {
      title: "نظام حماية البيانات (PDPL)",
      desc: "متوافق مع الأنظمة واللوائح الوطنية لحماية البيانات",
      badge: "سيادة وطنية",
    },
    {
      title: "توثيق قطعي بالأدلة",
      desc: "كل معلومة مقرونة برقم الصفحة والفقرة دون هلوسة",
      badge: "دقة متناهية",
    },
    {
      title: "سرعة استجابة فائقة",
      desc: "كاش استعلامات فوري بزمن استجابة 0.13 ثانية",
      badge: "أداء قياسي",
    },
  ];

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/60">
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="size-3.5" />
          <span>ضمانات الخصوصية والأمان السيادي</span>
        </div>
        <h3 className="text-2xl font-black tracking-tight text-foreground">
          معايير الثقة والخصوصية في منظومة Q9
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          طورت شركة Q9 هذه المنظومة وفق أشد المعايير الصارمة لضمان حماية خصوصية وسرية مستنداتك بالكامل.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {certs.map((c, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/80 bg-card p-4 text-right shadow-2xs hover:border-primary/50 transition-all flex flex-col justify-between"
          >
            <div>
              <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary mb-2 font-mono">
                {c.badge}
              </span>
              <h4 className="font-bold text-xs text-foreground">{c.title}</h4>
              <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                {c.desc}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-border/40 flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
              <CheckCircle2 className="size-3" />
              <span>مضمون محلياً</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── 2. Free Getting Started Guide (3 Simple Steps) ─────────────────────────
export function FreeGettingStartedSection() {
  const steps = [
    {
      num: "01",
      icon: UploadCloud,
      title: "ارفع مستنداتك بحرية",
      desc: "اسحب وأفلت أي ملف (عقود، تقارير سنوية، أبحاث، ميزانيات بصيغ PDF أو Word أو TXT) دون قيود.",
    },
    {
      num: "02",
      icon: HardDrive,
      title: "فهرسة ومعالجة محلية فورية",
      desc: "يقوم محرك Qdrant بتقسيم وتضمين المستندات دلالياً داخل جهازك بأجزاء من الثانية وبأعلى درجات السرية.",
    },
    {
      num: "03",
      icon: MessageSquare,
      title: "استنطق واطرح أي سؤال",
      desc: "اطرح استفساراتك باللغة العربية أو الإنجليزية، واستلم إجابات فورية موثقة برقم الصفحة والفقرة مجاناً.",
    },
  ];

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/60">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
          <Zap className="size-3.5" />
          <span>طريقة الاستخدام السهلة • مجاني ومتاح للجميع</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight">
          كيف تبدأ استخدام منظومة Q9 في 3 خطوات بسيطة؟
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          لا حاجة لأي تسجيل معقد أو بطاقات ائتمان — ادخل الاستوديو وابدأ استنطاق مستنداتك فورياً.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <div
            key={i}
            className="rounded-3xl border border-border/80 bg-card p-7 text-right space-y-4 relative overflow-hidden group hover:border-primary/60 transition-all shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <s.icon className="size-6" />
              </div>
              <span className="font-mono text-3xl font-black text-muted-foreground/30 group-hover:text-primary transition-colors">
                {s.num}
              </span>
            </div>
            <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/chat">
          <Button
            size="lg"
            className="h-12 px-8 text-sm font-bold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white shadow-xl shadow-blue-500/20 transition-all gap-2 cursor-pointer"
          >
            <MessageSquare className="size-4" />
            <span>ابدأ الاستخدام المجاني الآن في استوديو Q9</span>
          </Button>
        </Link>
      </div>
    </section>
  );
}

// ── 3. Frequently Asked Questions ──────────────────────────────────────────
export function EnterpriseFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "هل استخدام منظومة Q9 مجاني بالكامل؟",
      a: "نعم، طورت شركة Q9 للتقنيات هذه المنظومة وأتاحتها مجاناً بالكامل لكافة الباحثين، المؤسسات، وفرق العمل دون أي رسوم أو اشتراكات أو فترات تجريبية محدودة.",
    },
    {
      q: "أين تذهب مستنداتي وهل يتم حفظها على الإنترنت؟",
      a: "كافة المستندات والمعالجات والأسئلة تتم محلياً 100% داخل بيئتك الخاصة (Local / On-Premises). لا يتم رفع أي مستند إلى أي خوادم خارجية، مما يضمن الحفاظ التام على سرية وخصوصية بياناتك.",
    },
    {
      q: "ما هي الصيغ والملفات التي يستطيع النظام قراءتها؟",
      a: "يدعم النظام استيعاب مختلف صيغ المستندات بما في ذلك: ملفات PDF المعقدة، مستندات Word (.docx)، الملفات النصية (.txt, .md)، وجداول البيانات، مع تفكيك دقيق للجداول والفقرات.",
    },
    {
      q: "كيف تضمن شركة Q9 دقة الإجابات وعدم حدوث هلوسة؟",
      a: "يعتمد محرك Q9 معمارية الاستشهاد القطعي (Evidence Grounding). كل إجابة يقدمها النظام تكون مقرونة مباشرة بنص الفقرة الأصلية ورقم الصفحة، وإذا لم تكن الإجابة موجودة في المستند يعلن النظام ذلك صراحة دون تكهن.",
    },
  ];

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-border/60">
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
          <HelpCircle className="size-3.5" />
          <span>الأسئلة الشائعة</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
          كل ما تحتاج معرفته عن منظومة Q9 المجانية
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-border/80 bg-card transition-all overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`size-4 text-muted-foreground shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── 4. About Q9 Technologies & Direct Contact ──────────────────────────────
export function AboutQ9CompanySection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setStatus("submitting");
    setTimeout(() => {
      setStatus("success");
    }, 1000);
  };

  return (
    <section id="about" className="px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/60">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Side: About Q9 Corporate Story */}
        <div className="lg:col-span-6 text-right space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <Building2 className="size-3.5" />
            <span>عن شركة Q9 للتقنيات (Q9 Technologies Inc.)</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-snug">
            طُوّرت المنظومة من قِبل شركة Q9 للتقنيات والذكاء الاصطناعي
          </h2>

          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              **شركة Q9 للتقنيات والذكاء الاصطناعي (Q9 Technologies Inc.)** هي شركة متخصصة في أبحاث وتطوير نظم الذكاء الاصطناعي السيادي وهندسة الاسترجاع المعرفي المتقدم (Advanced RAG Systems).
            </p>
            <p>
              طورت الشركة هذا المحرك ليكون متاحاً ومجانياً بالكامل لخدمة المجتمع التقني، والباحثين، والمؤسسات التي تحتاج إلى استنطاق مستنداتها الحساسة بأمان محلي 100% دون الاعتماد على خوادم سحابية خارجية ودون أي تكاليف أو اشتراكات.
            </p>
          </div>

          <div className="space-y-3.5 pt-4 border-t border-border/60">
            {/* Direct Official Email */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-card p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Mail className="size-5" />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-semibold">البريد الرسمي للتواصل والشراكات</p>
                <p className="text-sm font-bold text-foreground font-mono">contact@q9.ai</p>
              </div>
            </div>

            {/* Regional Hubs */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-card p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <MapPin className="size-5" />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-semibold">المقر الرئيسي</p>
                <p className="text-xs font-bold text-foreground">
                  مركز الملك عبدالله المالي (KAFD)، الرياض • مركز دبي المالي (DIFC)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Simple Feedback / Inquiry Form */}
        <div className="lg:col-span-6">
          <Card3D>
            <div className="rounded-3xl border border-border/90 bg-card p-6 sm:p-8 shadow-xl relative overflow-hidden">
              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 text-center space-y-3"
                >
                  <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mx-auto">
                    <CheckCircle2 className="size-7" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-foreground">
                    تم استلام رسالتكم بنجاح
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    شكراً لتواصلكم مع شركة Q9 للتقنيات. سنقوم بالاطلاع على ملاحظاتكم أو استفساركم والرد عليكم قريباً.
                  </p>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStatus("idle")}
                      className="rounded-xl text-xs font-bold cursor-pointer"
                    >
                      إرسال رسالة أخرى
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-right">
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-foreground">
                      تواصل مع فريق شركة Q9
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      لديك اقتراح، استفسار تقني، أو رغبة في التعاون والشراكة؟ يسعدنا سماع صوتك.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">
                        الاسم الكريم *
                      </label>
                      <Input
                        required
                        placeholder="الاسم"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded-xl text-xs h-10"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">
                        البريد الإلكتروني *
                      </label>
                      <Input
                        required
                        type="email"
                        placeholder="name@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-xl text-xs h-10 font-mono text-left"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">
                      الموضوع
                    </label>
                    <Input
                      placeholder="مثال: استفسار تقني / اقتراح ميزة / تعاون وشراكة"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">
                      الرسالة أو الملاحظة *
                    </label>
                    <Textarea
                      required
                      rows={3}
                      placeholder="اكتب رسالتك أو استفسارك هنا..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="rounded-xl text-xs resize-none"
                    />
                  </div>

                  <div className="pt-1">
                    <Button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full h-11 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white shadow-md shadow-blue-500/20 cursor-pointer gap-2"
                    >
                      {status === "submitting" ? (
                        <>
                          <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>جاري الإرسال...</span>
                        </>
                      ) : (
                        <>
                          <Send className="size-3.5" />
                          <span>إرسال الرسالة إلى فريق Q9</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card3D>
        </div>
      </div>
    </section>
  );
}
