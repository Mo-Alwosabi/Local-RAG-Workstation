import { AppShell } from "@/components/layout/app-shell";
import { DocumentsList } from "@/components/documents/documents-list";

export default function DocumentsPage() {
  return (
    <AppShell activePath="/documents">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          إدارة المستندات وقاعدة المعرفة
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          استعراض وتحليل وفهرسة كافة الملفات المرفوعة وحذفها أو استجوابها
        </p>
      </div>

      <DocumentsList />
    </AppShell>
  );
}
