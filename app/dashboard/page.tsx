import { AppShell } from "@/components/layout/app-shell";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
  return (
    <AppShell activePath="/dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          لوحة القيادة والتحكم
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          نظرة عامة شاملة على قاعدة المعرفة، المستندات المفهرسة، ومؤشرات الأداء الحية
        </p>
      </div>

      <DashboardContent />
    </AppShell>
  );
}
