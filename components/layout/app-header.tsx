"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FileStack,
  MessageSquare,
  Home,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context/app-context";

const navItems = [
  { label: "الرئيسية", href: "/", icon: Home },
  { label: "المحادثة", href: "/chat", icon: MessageSquare, isLive: true },
  { label: "المستندات", href: "/documents", icon: FileStack },
  { label: "لوحة القيادة", href: "/dashboard", icon: LayoutDashboard },
  { label: "الإعدادات", href: "/settings", icon: Settings },
];

export function AppHeader({ activePath }: { activePath: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useApp();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Monogram */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background shadow-xs transition-transform group-hover:scale-105">
            <span className="font-mono font-black text-sm tracking-tighter">Q9</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-foreground">
              Q9 AI
            </span>
            <span className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase">
              RAG Engine
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? activePath === "/"
                : activePath === item.href || activePath.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions & Status */}
        <div className="flex items-center gap-2">
          {/* Neural Engine Status Pill */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-foreground" />
            <span>محلي متصل</span>
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="size-8 rounded-lg border-border text-foreground hover:bg-muted cursor-pointer"
            title={theme === "dark" ? "التحويل للوضع الفاتح" : "التحويل للوضع الداكن"}
          >
            {theme === "dark" ? (
              <Sun className="size-3.5 text-foreground" />
            ) : (
              <Moon className="size-3.5 text-foreground" />
            )}
          </Button>

          {/* Settings Link */}
          <Link href="/settings">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "size-8 rounded-lg border-border text-foreground hover:bg-muted cursor-pointer",
                activePath === "/settings" && "bg-foreground text-background"
              )}
              title="الإعدادات"
            >
              <Settings className="size-3.5" />
            </Button>
          </Link>

          {/* Quick Chat Link */}
          <Link href="/chat" className="hidden sm:block">
            <Button
              size="sm"
              className="h-8 px-3 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-none gap-1.5 cursor-pointer"
            >
              <MessageSquare className="size-3.5" />
              <span>المحادثة</span>
            </Button>
          </Link>

          {/* Mobile Menu Trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden size-9 rounded-xl"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="القائمة الرئيسية"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/60 bg-background/95 backdrop-blur-xl px-4 py-3 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? activePath === "/"
                : activePath === item.href || activePath.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </div>
                {item.isLive && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-500 font-bold">
                    مباشر
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
