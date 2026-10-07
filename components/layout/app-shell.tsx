import { CortexWorkstation } from "@/components/layout/cortex-workstation";

export function AppShell({
  activePath,
  children,
  fullBleed = false,
}: {
  activePath: string;
  children: React.ReactNode;
  fullBleed?: boolean;
}) {
  return (
    <CortexWorkstation activePath={activePath} fullBleed={fullBleed}>
      {children}
    </CortexWorkstation>
  );
}
