import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  ...props
}: React.ComponentProps<"span"> & {
  tone?: "default" | "success" | "warn" | "danger" | "gold" | "veg" | "nonveg";
}) {
  const tones = {
    default: "bg-black/5 text-foreground dark:bg-white/10",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200",
    warn: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-100",
    danger: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-100",
    gold: "bg-gold/20 text-amber-900 dark:text-gold",
    veg: "bg-emerald-100 text-emerald-800",
    nonveg: "bg-rose-100 text-rose-800",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
