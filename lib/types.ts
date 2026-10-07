export type DocumentStatus = "indexed" | "processing" | "failed" | "already_exists";

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  chunks: number;
  status: DocumentStatus;
  uploadedAt: Date;
  collectionId?: string;
  error?: string;
}

export interface DashboardStats {
  totalDocuments: number;
  totalChunks: number;
  storageUsed: number;
  storageLimit: number;
}

export interface Collection {
  id: string;
  name: string;
  documentCount: number;
  createdAt: Date;
}

export interface QuerySource {
  documentId?: string;
  documentName?: string;
  chunkText?: string;
  page?: number;
  score?: number;
}

export interface HealthInfo {
  status: string;
  gemini: string;
  qdrant: string;
  postgres: string;
  backend: string;
  environment: string;
  version?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: QuerySource[];
  isStreaming?: boolean;
  error?: string;
}

export const quickActions = [
  {
    id: "upload",
    label: "رفع مستند جديد",
    description: "إضافة ملفات PDF، عقود، أو نصوص",
    icon: "upload" as const,
    href: "/dashboard#upload",
  },
  {
    id: "chat",
    label: "استوديو المحادثة",
    description: "استجواب وتحليل فوري للمستندات",
    icon: "message" as const,
    href: "/chat",
  },
  {
    id: "search",
    label: "البحث الدلالي الذكي",
    description: "البحث بالمعنى عبر جميع الملفات",
    icon: "search" as const,
    href: "/chat",
  },
  {
    id: "settings",
    label: "إدارة قاعدة المعرفة",
    description: "عرض وحذف وإعادة تنظيم الفهرسة",
    icon: "settings" as const,
    href: "/documents",
  },
] as const;

export const suggestedQuestions = [
  "لخص أبرز النقاط والخبرات في المستندات المرفوعة",
  "ما هي المشاريع والمهام الرئيسية المذكورة؟",
  "ما هي المهارات التقنية واللغات المحددة؟",
  "استخرج أهم الإنجازات والشهادات من الملف",
];
