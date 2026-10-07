"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Upload,
  MessageSquare,
  Search,
  Settings2,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { quickActions } from "@/lib/types";
import { cn } from "@/lib/utils";

const iconMap = {
  upload: Upload,
  message: MessageSquare,
  search: Search,
  settings: Settings2,
};

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">إجراءات سريعة</CardTitle>
          <CardDescription className="text-xs">
            المهام الأساسية لإدارة المستندات واستجواب المعرفة
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {quickActions.map((action, index) => {
            const Icon = iconMap[action.icon];
            const isPrimary = action.id === "upload";

            const content = (
              <>
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg border",
                    isPrimary
                      ? "bg-neutral-200 text-black border-neutral-300"
                      : "bg-neutral-900 text-neutral-200 border-neutral-800"
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p
                    className={cn(
                      "mt-0.5 truncate text-xs",
                      isPrimary
                        ? "text-neutral-700 font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {action.description}
                  </p>
                </div>
                <ArrowUpRight
                  className={cn(
                    "size-4 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100",
                    isPrimary
                      ? "text-black"
                      : "text-neutral-400"
                  )}
                />
              </>
            );

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
              >
                {action.id === "upload" ? (
                  <Button
                    variant="outline"
                    className="group h-auto w-full justify-start gap-3 px-4 py-3.5 text-left bg-white text-black hover:bg-neutral-200 border-neutral-300 rounded-lg cursor-pointer"
                    onClick={() => {
                      const el = document.getElementById("upload");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {content}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="group h-auto w-full justify-start gap-3 px-4 py-3.5 text-left border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-200 rounded-lg cursor-pointer"
                    asChild
                  >
                    <Link href={action.href}>{content}</Link>
                  </Button>
                )}
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
