import { AppShell } from "@/components/layout/app-shell";
import { ChatInterface } from "@/components/chat/chat-interface";

export default function HomePage() {
  return (
    <AppShell activePath="/chat" fullBleed={true}>
      <ChatInterface />
    </AppShell>
  );
}

