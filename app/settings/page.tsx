import { AppShell } from "@/components/layout/app-shell";
import { SettingsPanel } from "@/components/settings/settings-panel";

export default function SettingsPage() {
  return (
    <AppShell activePath="/settings">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          إعدادات المنظومة والبنية التحتية
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          مراقبة خدمات الذكاء الاصطناعي، نماذج التضمين، وضبط معلمات الاسترجاع الدلالي (RAG)
        </p>
      </div>

      <SettingsPanel />
    </AppShell>
  );
}
